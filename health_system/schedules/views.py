from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import MedicationSchedule, DoseLog
from .serializers import CreateScheduleSerializer, MedicationScheduleSerializer, DoseLogSerializer


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_schedule(request):
    """
    Pharmacist adds a medication schedule to a prescription.
    """
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


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_schedule(request, prescription_id):
    """
    Get the schedule for a specific prescription.
    """
    try:
        schedule = MedicationSchedule.objects.get(prescription_id=prescription_id)
        serializer = MedicationScheduleSerializer(schedule)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except MedicationSchedule.DoesNotExist:
        return Response(
            {'error': 'No schedule found for this prescription.'},
            status=status.HTTP_404_NOT_FOUND
        )


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dose_logs(request, schedule_id):
    """
    Get all dose logs for a specific schedule.
    """
    dose_logs = DoseLog.objects.filter(schedule_id=schedule_id)
    serializer = DoseLogSerializer(dose_logs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_dose_taken(request, medicationId):
    """
    Patient marks a dose as taken.
    """
    if request.user.role != 'patient':
        return Response(
            {'error': 'Only patients can mark doses as taken.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        dose = DoseLog.objects.get(id=medicationId)
        dose.status   = 'taken'
        dose.taken_at = timezone.now()
        dose.save()
        return Response({
            'message': 'Dose marked as taken.',
        }, status=status.HTTP_200_OK)

    except DoseLog.DoesNotExist:
        return Response(
            {'error': 'Dose not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_medications(request, id):
    """
    Get all medications scheduled for today for a specific patient.
    Also automatically marks overdue doses as missed.
    """
    from django.utils import timezone
    from datetime import date, timedelta

    today = date.today()
    now   = timezone.now()

    schedules = MedicationSchedule.objects.filter(
        prescription__patient__id=id
    )

    data = []
    for schedule in schedules:
        today_doses = DoseLog.objects.filter(
            schedule_id=schedule.id,
            scheduled_time__date=today
        )

        for dose in today_doses:
            # Auto mark as missed if 90 minutes have passed
            if dose.status == 'pending':
                cutoff_time = dose.scheduled_time + timedelta(minutes=90)
                if now > cutoff_time:
                    dose.status = 'missed'
                    dose.save()

            data.append({
                'id':            dose.id,
                'name':          schedule.prescription.medication_name,
                'time':          dose.scheduled_time.strftime('%I:%M %p'),
                'scheduledTime': dose.scheduled_time,
                'taken':         dose.status == 'taken',
                'missed':        dose.status == 'missed',
            })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_schedule(request, id):
    """
    Get the full medication schedule for a specific patient.
    """
    schedules = MedicationSchedule.objects.filter(
        prescription__patient__id=id
    )

    data = []
    for schedule in schedules:
        dose_logs = DoseLog.objects.filter(schedule=schedule)
        doses = []
        for dose in dose_logs:
            doses.append({
                'id':            dose.id,
                'scheduledTime': dose.scheduled_time,
                'status':        dose.status,
                'takenAt':       dose.taken_at,
            })

        data.append({
            'scheduleId':     schedule.id,
            'medication':     schedule.prescription.medication_name,
            'dosage':         schedule.prescription.dosage,
            'frequency':      schedule.frequency,
            'duration':       schedule.duration,
            'specificTimes':  schedule.specific_times,
            'startDate':      schedule.start_date,
            'endDate':        schedule.end_date,
            'doses':          doses,
        })

    return Response(data, status=status.HTTP_200_OK)