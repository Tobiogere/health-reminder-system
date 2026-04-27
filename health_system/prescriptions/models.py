from django.db import models
from django.conf import settings

# Create your models here.
class Prescription(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACTIVE    = 'active',    'Active'
        COMPLETED = 'completed', 'Completed'

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prescriptions_as_doctor'
    )

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prescriptions_as_patient'
    )

    diagnosis      = models.TextField()
    medication_name = models.CharField(max_length=255)
    dosage         = models.CharField(max_length=100)  # e.g. 500mg, 2 tablets

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.patient} by {self.doctor} — {self.medication_name}"