from django.db import models
from django.conf import settings
from prescriptions.models import Prescription


class Appointment(models.Model):

    class Status(models.TextChoices):
        PENDING  = 'pending',  'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments_as_patient'
    )

    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    preferred_date = models.DateField()
    notes          = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments_reviewed'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment by {self.patient} on {self.preferred_date} — {self.status}"