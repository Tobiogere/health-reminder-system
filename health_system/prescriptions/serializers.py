from rest_framework import serializers
from .models import Prescription
from users.models import PatientProfile


class PrescriptionSerializer(serializers.ModelSerializer):

    # These are read-only fields we return in the response
    doctor_username  = serializers.CharField(source='doctor.username', read_only=True)
    patient_username = serializers.CharField(source='patient.username', read_only=True)
    patient_fullname = serializers.SerializerMethodField()

    class Meta:
        model  = Prescription
        fields = [
            'id',
            'doctor_username',
            'patient_username',
            'patient_fullname',
            'diagnosis',
            'medication_name',
            'dosage',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def get_patient_fullname(self, obj):
        try:
            return obj.patient.patient_profile.full_name
        except PatientProfile.DoesNotExist:
            return None


class CreatePrescriptionSerializer(serializers.ModelSerializer):
    """
    Used when a doctor creates a new prescription.
    Doctor sends: patient matric number, diagnosis, medication, dosage.
    """
    matric_number = serializers.CharField(write_only=True)

    class Meta:
        model  = Prescription
        fields = [
            'matric_number',
            'diagnosis',
            'medication_name',
            'dosage',
        ]

    def validate_matric_number(self, value):
        try:
            profile = PatientProfile.objects.get(matric_number=value)
            return value
        except PatientProfile.DoesNotExist:
            raise serializers.ValidationError("No patient found with this matric number.")

    def create(self, validated_data):
        matric_number = validated_data.pop('matric_number')
        patient_profile = PatientProfile.objects.get(matric_number=matric_number)

        prescription = Prescription.objects.create(
            doctor=self.context['request'].user,
            patient=patient_profile.user,
            **validated_data
        )
        return prescription