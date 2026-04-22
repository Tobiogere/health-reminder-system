from rest_framework import serializers
from .models import User, PatientProfile


class PatientRegistrationSerializer(serializers.ModelSerializer):
    """
    Used when a new patient registers.
    Creates both a User and a PatientProfile together.
    """

    # These fields come from PatientProfile, not User
    patient_type = serializers.ChoiceField(choices=PatientProfile.PatientType.choices)
    matric_number = serializers.CharField(max_length=50)
    full_name    = serializers.CharField(max_length=100)
    gender       = serializers.ChoiceField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    phone_number = serializers.CharField(max_length=20)
    department   = serializers.CharField(max_length=100, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username',
            'password',
            'patient_type',
            'matric_number',
            'full_name',
            'gender',
            'phone_number',
            'department',
        ]
        extra_kwargs = {
            'password': {'write_only': True}  # password never returned in response
        }

    def create(self, validated_data):
        # Separate profile data from user data
        profile_data = {
            'patient_type': validated_data.pop('patient_type'),
            'matric_number':   validated_data.pop('matric_number'),
            'full_name':    validated_data.pop('full_name'),
            'gender':       validated_data.pop('gender'),
            'phone_number': validated_data.pop('phone_number'),
            'department':   validated_data.pop('department', ''),
        }

        # Create the user with role = patient
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=User.Role.PATIENT
        )

        # Create the linked patient profile
        PatientProfile.objects.create(user=user, **profile_data)

        return user


class LoginSerializer(serializers.Serializer):
    """
    Used for logging in any user (doctor, pharmacist, patient).
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)