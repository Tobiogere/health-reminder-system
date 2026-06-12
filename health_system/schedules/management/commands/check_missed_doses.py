from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from schedules.models import DoseLog
from notifications.models import Notification
from datetime import timedelta
import json
import urllib.request
import urllib.error


def send_expo_push(push_token, title, body, data=None):
    """Send a push notification via Expo's push service."""
    if not push_token or not push_token.startswith('ExponentPushToken'):
        return
    message = {
        'to':    push_token,
        'title': title,
        'body':  body,
        'sound': 'default',
        'data':  data or {},
    }
    try:
        req = urllib.request.Request(
            'https://exp.host/--/api/v2/push/send',
            data=json.dumps(message).encode('utf-8'),
            headers={
                'Content-Type':  'application/json',
                'Accept':        'application/json',
                'Accept-Encoding': 'gzip, deflate',
            },
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            result = json.loads(res.read().decode())
            return result
    except Exception as e:
        print(f'Push notification error: {e}')
        return None


class Command(BaseCommand):
    help = 'Check for missed doses, create notifications, email caregivers, send push notifications'

    def handle(self, *args, **kwargs):
        now    = timezone.now()
        cutoff = now - timedelta(minutes=90)

        missed_doses = DoseLog.objects.filter(
            status='pending',
            scheduled_time__lte=cutoff,
        ).select_related('schedule__prescription__patient__patient_profile')

        count = 0
        for dose in missed_doses:
            dose.status = 'missed'
            dose.save()

            try:
                patient  = dose.schedule.prescription.patient
                med_name = dose.schedule.prescription.medication_name
                scheduled_time = dose.scheduled_time.astimezone(
                    timezone.get_current_timezone()
                ).strftime('%I:%M %p')

                already_exists = Notification.objects.filter(
                    user=patient, type='missed', drug=med_name,
                    time=scheduled_time, created_at__date=now.date(),
                ).exists()

                if not already_exists:
                    Notification.objects.create(
                        user=patient, type='missed',
                        message=f'You missed your {med_name} dose',
                        drug=med_name, time=scheduled_time,
                        read=False, missed=True,
                    )
                    count += 1

                    # Send push notification
                    if patient.push_token:
                        send_expo_push(
                            push_token=patient.push_token,
                            title='⚠️ Missed Dose Alert',
                            body=f'You missed your {med_name} dose scheduled at {scheduled_time}',
                            data={'screen': 'Notifications'},
                        )
                        self.stdout.write(f'Push sent to {patient.username}')

                    # Send caregiver email
                    caregiver_email = patient.caregiver_email
                    caregiver_name  = patient.caregiver_name or 'Caregiver'
                    try:
                        patient_name = patient.patient_profile.full_name
                    except:
                        patient_name = patient.username

                    if caregiver_email:
                        send_mail(
                            subject=f'Missed Dose Alert — {patient_name}',
                            message=f"""Dear {caregiver_name},

This is an automated alert from the Redeemer's University Health Centre Medication Reminder System.

{patient_name} missed their scheduled dose of {med_name} at {scheduled_time} today.

Please check in with them and encourage them to take their medication as prescribed.

If this is an emergency, please contact the Health Centre immediately.

— RUN Med Reminder System
Redeemer's University Health Centre""",
                            from_email=None,
                            recipient_list=[caregiver_email],
                            fail_silently=True,
                        )
                        self.stdout.write(f'Caregiver email sent to {caregiver_email}')

                    self.stdout.write(f'Missed dose: {patient.username} — {med_name}')
            except Exception as e:
                self.stdout.write(f'Error processing dose {dose.id}: {e}')

        self.stdout.write(self.style.SUCCESS(f'Done. {count} missed dose notifications created.'))