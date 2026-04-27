from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

# Create your models here.


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN      = 'admin',      'Admin'
        DOCTOR     = 'doctor',     'Doctor'
        PHARMACIST = 'pharmacist', 'Pharmacist'
        PATIENT    = 'patient',    'Patient'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PATIENT
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class PatientProfile(models.Model):

    class PatientType(models.TextChoices):
        STUDENT  = 'student',  'Student'
        STAFF    = 'staff',    'Staff'
        EXTERNAL = 'external', 'External'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )

    patient_type = models.CharField(
        max_length=20,
        choices=PatientType.choices
    )

    matric_number = models.CharField(max_length=50, unique=True)  # matric/staff/generated ID
    full_name = models.CharField(max_length=100)
    gender = models.CharField(
        max_length=10,
        choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    )
    phone_number = models.CharField(max_length=20)
    department = models.CharField(max_length=100, blank=True, null=True)  # not required for external patients

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} [{self.patient_id}]"

    @staticmethod
    def generate_external_id():
        return f"EXT-{uuid.uuid4().hex[:8].upper()}"