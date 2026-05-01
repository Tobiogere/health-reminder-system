from django.db import models
from django.conf import settings


class Drug(models.Model):
    """
    Approved drugs that doctors can prescribe.
    """
    name       = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class DrugSuggestion(models.Model):
    """
    Drugs suggested by doctors that need admin approval.
    """

    class Status(models.TextChoices):
        PENDING  = 'pending',  'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    drug         = models.CharField(max_length=100)
    suggested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='drug_suggestions'
    )
    status     = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.drug} suggested by {self.suggested_by}"