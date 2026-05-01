from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_notifications, name='get_notifications'),
    path('<int:id>/read', views.mark_notification_read, name='mark_notification_read'),
    path('read-all', views.mark_all_notifications_read, name='mark_all_notifications_read'),
]