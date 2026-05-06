from django.db import models
from django.conf import settings


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        REMINDER = 'reminder', 'Reminder'
        MISSED   = 'missed',   'Missed'
        RENEWAL  = 'renewal',  'Renewal'

    user    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    type    = models.CharField(
        max_length=20,
        choices=NotificationType.choices
    )

    message = models.TextField()
    drug    = models.CharField(max_length=100, blank=True, null=True)
    time    = models.CharField(max_length=20, blank=True, null=True)
    read    = models.BooleanField(default=False)
    missed  = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} notification for {self.user}"