from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from .models import MedicationSchedule, DoseLog
from .serializers import (
    CreateScheduleSerializer,
    MedicationScheduleSerializer,
    DoseLogSerializer
)

from prescriptions.utils import update_prescription_status


# -----------------------------
# CREATE SCHEDULE
# -----------------------------
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_schedule(request):

    if request.user.role != 'pharmacist':
        return Response(
            {'error': 'Only pharmacists can create schedules.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = CreateScheduleSerializer(data=request.data)

    if serializer.is_valid():
        schedule = serializer.save()
        return Response({
            'message': 'Schedule created successfully.',
            'schedule': MedicationScheduleSerializer(schedule).data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# GET SINGLE SCHEDULE
# -----------------------------
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_schedule(request, prescription_id):

    try:
        schedule = MedicationSchedule.objects.get(
            prescription_id=prescription_id
        )
        return Response(
            MedicationScheduleSerializer(schedule).data,
            status=status.HTTP_200_OK
        )

    except MedicationSchedule.DoesNotExist:
        return Response(
            {'error': 'No schedule found for this prescription.'},
            status=status.HTTP_404_NOT_FOUND
        )


# -----------------------------
# DOSE LOGS
# -----------------------------
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dose_logs(request, schedule_id):

    dose_logs = DoseLog.objects.filter(schedule_id=schedule_id)
    return Response(
        DoseLogSerializer(dose_logs, many=True).data,
        status=status.HTTP_200_OK
    )


# -----------------------------
# MARK DOSE AS TAKEN
# -----------------------------
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_dose_taken(request, medicationId):

    if request.user.role != 'patient':
        return Response(
            {'error': 'Only patients can mark doses as taken.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        dose = DoseLog.objects.get(id=medicationId)

        dose.taken_at = timezone.now()
        dose.status = 'taken'
        dose.save()

        # update prescription AFTER saving dose
        update_prescription_status(dose.schedule.prescription)

        return Response(
            {'message': 'Dose marked as taken.'},
            status=status.HTTP_200_OK
        )

    except DoseLog.DoesNotExist:
        return Response(
            {'error': 'Dose not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


# -----------------------------
# TODAY MEDICATIONS
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_medications(request, id):

    today = timezone.now().date()

    schedules = MedicationSchedule.objects.filter(
        prescription__patient__id=id
    )

    data = []

    for schedule in schedules:
        today_doses = DoseLog.objects.filter(
            schedule=schedule,
            scheduled_time__date=today
        )

        for dose in today_doses:

            # AUTO-MISS LOGIC (important)
            if dose.status == 'pending':
                if timezone.now() > dose.scheduled_time:
                    dose.status = 'missed'
                    dose.save()

            data.append({
                'id': dose.id,
                'name': schedule.prescription.medication_name,
                'time': dose.scheduled_time.strftime('%I:%M %p'),
                'scheduledTime': dose.scheduled_time,
                'status': dose.status,
            })

    return Response(data, status=status.HTTP_200_OK)


# -----------------------------
# FULL SCHEDULE
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_schedule(request, id):

    schedules = MedicationSchedule.objects.filter(
        prescription__patient__id=id
    )

    data = []

    for schedule in schedules:
        dose_logs = DoseLog.objects.filter(schedule=schedule)

        doses = []
        for dose in dose_logs:

            # AUTO UPDATE MISSED STATUS
            if dose.status == 'pending':
                if timezone.now() > dose.scheduled_time:
                    dose.status = 'missed'
                    dose.save()

            doses.append({
                'id': dose.id,
                'scheduledTime': dose.scheduled_time,
                'status': dose.status,
                'takenAt': dose.taken_at,
            })

        data.append({
            'scheduleId': schedule.id,
            'medication': schedule.prescription.medication_name,
            'dosage': schedule.prescription.dosage,
            'frequency': schedule.frequency,
            'duration': schedule.duration,
            'specificTimes': schedule.specific_times,
            'startDate': schedule.start_date,
            'endDate': schedule.end_date,
            'doses': doses,
        })

    return Response(data, status=status.HTTP_200_OK)