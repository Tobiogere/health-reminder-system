from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Drug, DrugSuggestion


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_drugs(request):
    """
    Get all approved drugs.
    """
    drugs = Drug.objects.all().order_by('name')
    data  = [drug.name for drug in drugs]
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suggest_drug(request):
    """
    Doctor suggests a new drug.
    """
    if request.user.role != 'doctor':
        return Response(
            {'message': 'Only doctors can suggest drugs.'},
            status=status.HTTP_403_FORBIDDEN
        )

    drug_name   = request.data.get('drugName')
    doctor_name = request.data.get('doctorName', request.user.username)

    if not drug_name:
        return Response(
            {'message': 'drugName is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    DrugSuggestion.objects.create(
        drug=drug_name,
        suggested_by=request.user
    )

    return Response(
        {'message': 'Drug suggestion submitted successfully.'},
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_drug_suggestions(request):
    """
    Admin gets all drug suggestions.
    """
    if request.user.role != 'admin':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    suggestions = DrugSuggestion.objects.all().order_by('-created_at')
    data = []
    for s in suggestions:
        data.append({
            'id':          s.id,
            'drug':        s.drug,
            'suggestedBy': s.suggested_by.username,
            'date':        s.created_at,
            'status':      s.status,
        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def approve_drug(request, id):
    """
    Admin approves a drug suggestion and adds it to the approved list.
    """
    if request.user.role != 'admin':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        suggestion        = DrugSuggestion.objects.get(id=id)
        suggestion.status = 'approved'
        suggestion.save()

        # Add to approved drugs list
        Drug.objects.get_or_create(name=suggestion.drug)

        return Response(
            {'message': 'Drug approved and added to the list.'},
            status=status.HTTP_200_OK
        )

    except DrugSuggestion.DoesNotExist:
        return Response(
            {'message': 'Suggestion not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def reject_drug(request, id):
    """
    Admin rejects a drug suggestion.
    """
    if request.user.role != 'admin':
        return Response(
            {'message': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        suggestion        = DrugSuggestion.objects.get(id=id)
        suggestion.status = 'rejected'
        suggestion.save()

        return Response(
            {'message': 'Drug suggestion rejected.'},
            status=status.HTTP_200_OK
        )

    except DrugSuggestion.DoesNotExist:
        return Response(
            {'message': 'Suggestion not found.'},
            status=status.HTTP_404_NOT_FOUND
        )