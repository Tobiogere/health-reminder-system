from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Prescription
from users.models import User, PatientProfile


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_prescription(request):
    """
    Doctor creates a prescription for a patient.
    """
    if request.user.role != 'doctor':
        return Response(
            {'message': 'Only doctors can create prescriptions.'},
            status=status.HTTP_403_FORBIDDEN
        )

    data       = request.data
    patient_id = data.get('patientId')
    diagnosis  = data.get('diagnosis')
    drugs      = data.get('drugs', [])
    notes      = data.get('notes', '')
    doctor_name = data.get('doctorName', request.user.username)

    if not patient_id or not diagnosis or not drugs:
        return Response(
            {'message': 'patientId, diagnosis and drugs are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        patient = User.objects.get(id=patient_id)
    except User.DoesNotExist:
        return Response(
            {'message': 'Patient not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Create one prescription per drug
    prescriptions = []
    for drug in drugs:
        prescription = Prescription.objects.create(
            doctor=request.user,
            patient=patient,
            diagnosis=diagnosis,
            medication_name=drug,
            dosage='',
            status='pending'
        )
        prescriptions.append({
            'id':        prescription.id,
            'patientId': patient.id,
            'status':    prescription.status,
            'createdAt': prescription.created_at,
        })

    return Response(prescriptions[0] if len(prescriptions) == 1 else prescriptions,
                    status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_prescription_queue(request):
    """
    Pharmacist gets all pending prescriptions.
    """
    if request.user.role != 'pharmacist':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    prescriptions = Prescription.objects.filter(status='pending')
    data = []
    for p in prescriptions:
        try:
            patient_name = p.patient.patient_profile.full_name
        except:
            patient_name = p.patient.username

        data.append({
            'id':             p.id,
            'patientName':    patient_name,
            'patientId':      p.patient.id,
            'diagnosis':      p.diagnosis,
            'medicationName': p.medication_name,
            'status':         p.status,
            'createdAt':      p.created_at,
        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctor_prescriptions(request, doctor_id):
    """
    Get all prescriptions created by a specific doctor.
    """
    if request.user.role not in ['doctor', 'admin']:
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    prescriptions = Prescription.objects.filter(doctor_id=doctor_id)
    data = []
    for p in prescriptions:
        try:
            patient_name = p.patient.patient_profile.full_name
        except:
            patient_name = p.patient.username

        data.append({
            'id':             p.id,
            'patientName':    patient_name,
            'patientId':      p.patient.id,
            'diagnosis':      p.diagnosis,
            'medicationName': p.medication_name,
            'status':         p.status,
            'createdAt':      p.created_at,
        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def add_dosage(request, id):
    """
    Pharmacist adds dosage to a prescription.
    """
    if request.user.role != 'pharmacist':
        return Response(
            {'message': 'Only pharmacists can add dosage.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        prescription = Prescription.objects.get(id=id)
    except Prescription.DoesNotExist:
        return Response(
            {'message': 'Prescription not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    data    = request.data
    dosages = data.get('dosages', [])

    if not dosages:
        return Response(
            {'message': 'dosages are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Update prescription dosage
    dosage_data = dosages[0]
    prescription.dosage = dosage_data.get('dosage', '')
    prescription.status = 'active'
    prescription.save()

    # Generate schedule
    from schedules.models import MedicationSchedule, DoseLog
    from datetime import datetime, timedelta, date

    frequency      = dosage_data.get('frequency', 1)
    duration       = dosage_data.get('duration', 7)
    times          = dosage_data.get('times', [])
    start_date     = date.today()
    end_date       = start_date + timedelta(days=duration)

    schedule = MedicationSchedule.objects.create(
        prescription=prescription,
        frequency=frequency,
        duration=duration,
        specific_times=times,
        start_date=start_date,
        end_date=end_date
    )

    # Generate dose logs
    for day in range(duration):
        current_date = start_date + timedelta(days=day)
        for time_str in times:
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

    return Response(
        {'message': 'Dosage added and schedule generated successfully.'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_prescriptions(request):
    """
    Admin gets all prescriptions.
    """
    if request.user.role != 'admin':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    prescriptions = Prescription.objects.all()
    data = []
    for p in prescriptions:
        try:
            patient_name = p.patient.patient_profile.full_name
        except:
            patient_name = p.patient.username

        data.append({
            'id':             p.id,
            'patientName':    patient_name,
            'patientId':      p.patient.id,
            'diagnosis':      p.diagnosis,
            'medicationName': p.medication_name,
            'dosage':         p.dosage,
            'status':         p.status,
            'createdAt':      p.created_at,
        })

    return Response(data, status=status.HTTP_200_OK)