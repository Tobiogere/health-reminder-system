from rest_framework import serializers
from .models import MedicationSchedule, DoseLog
from datetime import datetime, timedelta


class MedicationScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model  = MedicationSchedule
        fields = [
            'id',
            'prescription',
            'frequency',
            'duration',
            'specific_times',
            'start_date',
            'end_date',
            'created_at',
        ]
        read_only_fields = ['id', 'end_date', 'created_at']


class CreateScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model  = MedicationSchedule
        fields = [
            'prescription',
            'frequency',
            'duration',
            'specific_times',
            'start_date',
        ]

    def validate(self, data):
        if len(data['specific_times']) != data['frequency']:
            raise serializers.ValidationError(
                f"You said frequency is {data['frequency']} but provided {len(data['specific_times'])} times."
            )
        return data

    def create(self, validated_data):
        start_date = validated_data['start_date']
        duration   = validated_data['duration']
        end_date   = start_date + timedelta(days=duration)

        schedule = MedicationSchedule.objects.create(
            **validated_data,
            end_date=end_date
        )

        self.generate_dose_logs(schedule)
        return schedule

    def generate_dose_logs(self, schedule):
        start_date = schedule.start_date

        for day in range(schedule.duration):
            current_date = start_date + timedelta(days=day)

            for time_str in schedule.specific_times:
                hour, minute   = map(int, time_str.split(':'))
                scheduled_time = datetime(
                    current_date.year,
                    current_date.month,
                    current_date.day,
                    hour,
                    minute
                )

                DoseLog.objects.create(
                    schedule=schedule,
                    scheduled_time=scheduled_time
                )


class DoseLogSerializer(serializers.ModelSerializer):

    class Meta:
        model  = DoseLog
        fields = [
            'id',
            'schedule',
            'scheduled_time',
            'status',
            'taken_at',
        ]
        read_only_fields = ['id', 'scheduled_time', 'taken_at']