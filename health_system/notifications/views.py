from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """
    Get all notifications for the current user.
    """
    notifications = Notification.objects.filter(
        user=request.user
    ).order_by('-created_at')

    data = []
    for n in notifications:
        data.append({
            'id':        n.id,
            'type':      n.type,
            'message':   n.message,
            'drug':      n.drug,
            'time':      n.time,
            'read':      n.read,
            'missed':    n.missed,
            'createdAt': n.created_at,
        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, id):
    """
    Mark a single notification as read.
    """
    try:
        notification = Notification.objects.get(id=id, user=request.user)
        notification.read = True
        notification.save()
        return Response(
            {'message': 'Notification marked as read.'},
            status=status.HTTP_200_OK
        )
    except Notification.DoesNotExist:
        return Response(
            {'message': 'Notification not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read for the current user.
    """
    Notification.objects.filter(
        user=request.user,
        read=False
    ).update(read=True)

    return Response(
        {'message': 'All notifications marked as read.'},
        status=status.HTTP_200_OK
    )