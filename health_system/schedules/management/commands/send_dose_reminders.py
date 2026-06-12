from django.core.management.base import BaseCommand
from django.utils import timezone
from schedules.models import DoseLog
import json
import urllib.request
from datetime import timedelta


def send_expo_push(push_token, title, body, data=None):
    if not push_token or not push_token.startswith('ExponentPushToken'):
        return
    message = {
        'to': push_token, 'title': title, 'body': body,
        'sound': 'default', 'data': data or {},
    }
    try:
        req = urllib.request.Request(
            'https://exp.host/--/api/v2/push/send',
            data=json.dumps(message).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            return json.loads(res.read().decode())
    except Exception as e:
        print(f'Push error: {e}')


class Command(BaseCommand):
    help = 'Send push reminders for doses due in the next 15 minutes'

    def handle(self, *args, **kwargs):
        now  = timezone.now()
        soon = now + timedelta(minutes=15)

        upcoming = DoseLog.objects.filter(
            status='pending',
            scheduled_time__gte=now,
            scheduled_time__lte=soon,
        ).select_related('schedule__prescription__patient')

        count = 0
        for dose in upcoming:
            patient  = dose.schedule.prescription.patient
            med_name = dose.schedule.prescription.medication_name
            due_time = dose.scheduled_time.astimezone(
                timezone.get_current_timezone()
            ).strftime('%I:%M %p')

            if patient.push_token:
                send_expo_push(
                    push_token=patient.push_token,
                    title='💊 Medication Reminder',
                    body=f'Time to take your {med_name} at {due_time}',
                    data={'screen': 'Dashboard'},
                )
                self.stdout.write(f'Reminder sent: {patient.username} — {med_name} at {due_time}')
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Done. {count} reminders sent.'))