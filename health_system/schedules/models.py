from django.db import models
from django.utils import timezone
from datetime import timedelta
from prescriptions.models import Prescription


class MedicationSchedule(models.Model):
    prescription = models.OneToOneField(
        Prescription,
        on_delete=models.CASCADE,
        related_name='schedule'
    )

    frequency = models.IntegerField()
    duration = models.IntegerField()
    specific_times = models.JSONField()

    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Schedule for Prescription {self.prescription.id}"


class DoseLog(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        TAKEN = "taken", "Taken"
        MISSED = "missed", "Missed"

    schedule = models.ForeignKey(
        MedicationSchedule,
        on_delete=models.CASCADE,
        related_name='dose_logs'
    )

    scheduled_time = models.DateTimeField(null=True, blank=True)
    taken_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.scheduled_time} - {self.status}"

    # -----------------------------
    # CORE STATUS LOGIC (SINGLE SOURCE OF TRUTH)
    # -----------------------------

    def get_effective_status(self):
        if self.taken_at:
            return self.Status.TAKEN

        if self.scheduled_time and self.scheduled_time < timezone.now() - timedelta(minutes=90):
            return self.Status.MISSED

        return self.Status.PENDING