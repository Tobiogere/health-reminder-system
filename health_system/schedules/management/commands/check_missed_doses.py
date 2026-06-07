from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from schedules.models import DoseLog
from notifications.models import Notification
from datetime import timedelta


class Command(BaseCommand):
    help = 'Check for missed doses, create notifications and email caregivers'

    def handle(self, *args, **kwargs):
        now = timezone.now()
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

                    # Send caregiver email — read from User model
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
                            fail_silently=False,
                        )
                        self.stdout.write(f'Caregiver email sent to {caregiver_email}')
                    else:
                        self.stdout.write(f'No caregiver email for {patient.username}')

                    self.stdout.write(f'Missed dose: {patient.username} — {med_name}')
            except Exception as e:
                self.stdout.write(f'Error processing dose {dose.id}: {e}')

        self.stdout.write(self.style.SUCCESS(f'Done. {count} missed dose notifications created.'))
