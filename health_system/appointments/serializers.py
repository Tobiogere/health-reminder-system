from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Returns full appointment details in responses.
    """
    patient_username    = serializers.CharField(source='patient.username', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True)

    class Meta:
        model  = Appointment
        fields = [
            'id',
            'patient_username',
            'prescription',
            'preferred_date',
            'notes',
            'status',
            'reviewed_by_username',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'reviewed_by_username', 'created_at']


class CreateAppointmentSerializer(serializers.ModelSerializer):
    """
    Used when a patient books a renewal appointment.
    """

    class Meta:
        model  = Appointment
        fields = [
            'prescription',
            'preferred_date',
            'notes',
        ]

    def create(self, validated_data):
        appointment = Appointment.objects.create(
            patient=self.context['request'].user,
            **validated_data
        )
        return appointment


class ReviewAppointmentSerializer(serializers.ModelSerializer):
    """
    Used when a pharmacist approves or rejects an appointment.
    """

    class Meta:
        model  = Appointment
        fields = ['status']

    def update(self, instance, validated_data):
        instance.status      = validated_data.get('status', instance.status)
        instance.reviewed_by = self.context['request'].user
        instance.save()
        return instance