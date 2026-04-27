from django.db import models
from prescriptions.models import Prescription
from datetime import timedelta


class MedicationSchedule(models.Model):

    prescription = models.OneToOneField(
        Prescription,
        on_delete=models.CASCADE,
        related_name='schedule'
    )

    frequency      = models.IntegerField()   # e.g. 3 (times per day)
    duration       = models.IntegerField()   # e.g. 7 (number of days)
    specific_times = models.JSONField()      # e.g. ["08:00", "14:00", "20:00"]
    start_date     = models.DateField()
    end_date       = models.DateField(blank=True, null=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Schedule for Prescription {self.prescription.id}"


class DoseLog(models.Model):

    class Status(models.TextChoices):
        TAKEN  = 'taken',  'Taken'
        MISSED = 'missed', 'Missed'

    schedule       = models.ForeignKey(
        MedicationSchedule,
        on_delete=models.CASCADE,
        related_name='dose_logs'
    )

    scheduled_time = models.DateTimeField()
    status         = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.MISSED
    )
    taken_at       = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Dose at {self.scheduled_time} — {self.status}"