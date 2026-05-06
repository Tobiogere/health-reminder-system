from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PatientProfile


def get_tokens_for_user(user):
    """Generate JWT token for a user."""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user.
    Handles patient types: student, staff, external.
    """
    data        = request.data
    full_name   = data.get('fullName')
    gender      = data.get('gender')
    phone       = data.get('phoneNumber')
    role        = data.get('role', 'patient')
    password    = data.get('password')
    patient_type = data.get('patientType')
    matric_number = data.get('matricNumber')
    staff_id    = data.get('staffId')
    department  = data.get('department')

    # Basic validation
    if not full_name or not password or not role:
        return Response(
            {'message': 'fullName, password and role are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Determine identifier based on patient type
    if role == 'patient':
        if patient_type == 'student':
            identifier = matric_number
        elif patient_type == 'staff':
            identifier = staff_id
        elif patient_type == 'external':
            identifier = phone
        else:
            return Response(
                {'message': 'Invalid patient type.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not identifier:
            return Response(
                {'message': 'Please provide matricNumber, staffId or phoneNumber.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if identifier already exists
        if PatientProfile.objects.filter(matric_number=identifier).exists():
            return Response(
                {'message': 'A patient with this identifier already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            username=identifier,
            password=password,
            role=role
        )

        # Create patient profile
        PatientProfile.objects.create(
            user=user,
            patient_type=patient_type,
            matric_number=identifier,
            full_name=full_name,
            gender=gender,
            phone_number=phone,
            department=department or ''
        )

    else:
        # For doctor, pharmacist, admin
        if User.objects.filter(username=full_name).exists():
            return Response(
                {'message': 'A user with this name already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=full_name,
            password=password,
            role=role
        )

    return Response(
        {'message': 'Registration successful.'},
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login any user.
    Returns JWT token and user details.
    """
    data       = request.data
    identifier = data.get('identifier')
    password   = data.get('password')
    role       = data.get('role')

    if not identifier or not password:
        return Response(
            {'message': 'identifier and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=identifier, password=password)

    if user is None:
        return Response(
            {'message': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Build user info for response
    user_data = {
        'id': user.id,
        'name': user.username,
        'role': user.role,
        'identifier': user.username,
        'patientType': None,
        'department': None,
    }

    # Add patient specific info
    if hasattr(user, 'patient_profile'):
        profile = user.patient_profile
        user_data['name']        = profile.full_name
        user_data['patientType'] = profile.patient_type
        user_data['department']  = profile.department
        user_data['identifier']  = profile.matric_number

    token = get_tokens_for_user(user)

    return Response({
        'token': token,
        'user': user_data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout current user.
    """
    return Response(
        {'message': 'Logged out successfully.'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_patient(request, identifier):
    """
    Search patient by identifier.
    """
    if request.user.role not in ['doctor', 'pharmacist', 'admin']:
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        profile = PatientProfile.objects.get(matric_number=identifier)
        return Response({
            'id':                profile.user.id,
            'name':              profile.full_name,
            'gender':            profile.gender,
            'patientType':       profile.patient_type,
            'department':        profile.department,
            'phone':             profile.phone_number,
            'prescriptionCount': profile.user.prescriptions_as_patient.count(),
            'lastVisit':         profile.user.prescriptions_as_patient.last().created_at if profile.user.prescriptions_as_patient.exists() else None,
        }, status=status.HTTP_200_OK)

    except PatientProfile.DoesNotExist:
        return Response(
            {'message': 'Patient not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_prescriptions(request, id):
    """
    Get all prescriptions for a specific patient.
    """
    if request.user.role not in ['doctor', 'pharmacist', 'admin']:
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        from prescriptions.models import Prescription
        patient = User.objects.get(id=id)
        prescriptions = Prescription.objects.filter(patient=patient)

        data = []
        for p in prescriptions:
            data.append({
                'id':             p.id,
                'diagnosis':      p.diagnosis,
                'medicationName': p.medication_name,
                'dosage':         p.dosage,
                'status':         p.status,
                'createdAt':      p.created_at,
            })

        return Response(data, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response(
            {'message': 'Patient not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update the current user's profile.
    """
    data      = request.data
    full_name = data.get('fullName')
    phone     = data.get('phone')

    try:
        profile = request.user.patient_profile
        if full_name:
            profile.full_name = full_name
        if phone:
            profile.phone_number = phone
        profile.save()
    except:
        # For non-patient users (doctors, pharmacists)
        if full_name:
            request.user.username = full_name
            request.user.save()

    return Response(
        {'message': 'Profile updated successfully.'},
        status=status.HTTP_200_OK
    )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_password(request):
    """
    Update the current user's password.
    """
    data             = request.data
    current_password = data.get('currentPassword')
    new_password     = data.get('newPassword')

    if not current_password or not new_password:
        return Response(
            {'message': 'currentPassword and newPassword are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not request.user.check_password(current_password):
        return Response(
            {'message': 'Current password is incorrect.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    request.user.set_password(new_password)
    request.user.save()

    return Response(
        {'message': 'Password updated successfully.'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    """
    Admin gets a list of all users.
    """
    if request.user.role != 'admin':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    users = User.objects.all().order_by('-date_joined')
    data  = []

    for u in users:
        user_data = {
            'id':          u.id,
            'name':        u.username,
            'role':        u.role,
            'status':      'Active' if u.is_active else 'Suspended',
            'joined':      u.date_joined,
            'identifier':  u.username,
            'patientType': None,
        }

        if hasattr(u, 'patient_profile'):
            user_data['name']        = u.patient_profile.full_name
            user_data['identifier']  = u.patient_profile.matric_number
            user_data['patientType'] = u.patient_profile.patient_type

        data.append(user_data)

    return Response(data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_status(request, id):
    """
    Admin suspends or activates a user.
    """
    if request.user.role != 'admin':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user        = User.objects.get(id=id)
        new_status  = request.data.get('status')

        if new_status == 'Active':
            user.is_active = True
        elif new_status == 'Suspended':
            user.is_active = False
        else:
            return Response(
                {'message': 'Status must be Active or Suspended.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.save()
        return Response(
            {'message': f'User status updated to {new_status}.'},
            status=status.HTTP_200_OK
        )

    except User.DoesNotExist:
        return Response(
            {'message': 'User not found.'},
            status=status.HTTP_404_NOT_FOUND
        )