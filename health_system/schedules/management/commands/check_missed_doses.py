from django.core.management.base import BaseCommand
from django.utils import timezone
from schedules.models import DoseLog
from notifications.models import Notification
from datetime import timedelta


class Command(BaseCommand):
    help = 'Check for missed doses and create notifications'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        cutoff = now - timedelta(minutes=90)

        # Find all pending doses that are 90+ minutes past scheduled time
        missed_doses = DoseLog.objects.filter(
            status='pending',
            scheduled_time__lte=cutoff,
        ).select_related('schedule__prescription__patient')

        count = 0
        for dose in missed_doses:
            # Mark dose as missed
            dose.status = 'missed'
            dose.save()

            # Get patient user
            try:
                patient = dose.schedule.prescription.patient
                med_name = dose.schedule.prescription.medication_name
                scheduled_time = dose.scheduled_time.astimezone(
                    timezone.get_current_timezone()
                ).strftime('%I:%M %p')

                # Create missed dose notification if not already created
                already_exists = Notification.objects.filter(
                    user=patient,
                    type='missed',
                    drug=med_name,
                    time=scheduled_time,
                    created_at__date=now.date(),
                ).exists()

                if not already_exists:
                    Notification.objects.create(
                        user=patient,
                        type='missed',
                        message=f'You missed your {med_name} dose',
                        drug=med_name,
                        time=scheduled_time,
                        read=False,
                        missed=True,
                    )
                    count += 1
                    self.stdout.write(
                        f'Missed dose notification created for {patient.username} — {med_name}'
                    )
            except Exception as e:
                self.stdout.write(f'Error processing dose {dose.id}: {e}')

        self.stdout.write(
            self.style.SUCCESS(f'Done. {count} missed dose notifications created.')
        )