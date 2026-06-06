from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from prescriptions.models import Prescription
from .models import Appointment
from .serializers import AppointmentSerializer, CreateAppointmentSerializer, ReviewAppointmentSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_renewal(request, id):
    """
    Patient books a renewal appointment.
    """
    if request.user.role != 'patient':
        return Response(
            {'message': 'Only patients can book renewals.'},
            status=status.HTTP_403_FORBIDDEN
        )

    data     = request.data
    drug     = data.get('drugName')
    note     = data.get('note', '')

    if not drug:
        return Response(
            {'message': 'drugName is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    from prescriptions.models import Prescription
    prescription = Prescription.objects.filter(
        patient=request.user
    ).last()

    if not prescription:
        return Response(
            {'message': 'No prescription found for this patient.'},
            status=status.HTTP_404_NOT_FOUND
        )

    from datetime import date
    appointment = Appointment.objects.create(
        patient=request.user,
        prescription=prescription,
        preferred_date=date.today(),
        notes=note,
        status='pending'
    )

    return Response(
        {'message': 'Renewal request submitted successfully.'},
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_renewals(request):
    """
    Pharmacist gets all renewal requests.
    """
    if request.user.role != 'pharmacist':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    appointments = Appointment.objects.all().order_by('-created_at')
    data = []
    for a in appointments:
        try:
            patient_name = a.patient.patient_profile.full_name
            patient_id   = a.patient.patient_profile.matric_number
        except:
            patient_name = a.patient.username
            patient_id   = a.patient.id

        data.append({
            'id':          a.id,
            'patientName': patient_name,
            'patientId':   patient_id,
            'drug':        a.prescription.medication_name,
            'note':        a.notes,
            'requestDate': a.created_at,
            'status':      a.status,
        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def approve_renewal(request, id):
    """
    Pharmacist approves a renewal request.
    """
    if request.user.role != 'pharmacist':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        appointment             = Appointment.objects.get(id=id)
        appointment.status      = 'approved'
        appointment.reviewed_by = request.user
        appointment.save()
        return Response(
            {'message': 'Renewal approved successfully.'},
            status=status.HTTP_200_OK
        )

    except Appointment.DoesNotExist:
        return Response(
            {'message': 'Renewal not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def reject_renewal(request, id):
    """
    Pharmacist rejects a renewal request.
    """
    if request.user.role != 'pharmacist':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        appointment             = Appointment.objects.get(id=id)
        appointment.status      = 'rejected'
        appointment.reviewed_by = request.user
        appointment.save()
        return Response(
            {'message': 'Renewal rejected.'},
            status=status.HTTP_200_OK
        )

    except Appointment.DoesNotExist:
        return Response(
            {'message': 'Renewal not found.'},
            status=status.HTTP_404_NOT_FOUND
        )