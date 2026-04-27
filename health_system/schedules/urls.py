from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_schedule, name='create_schedule'),
    path('<int:prescription_id>/', views.get_schedule, name='get_schedule'),
    path('dose-logs/<int:schedule_id>/', views.get_dose_logs, name='get_dose_logs'),
    path('dose/<int:dose_id>/taken/', views.mark_dose_taken, name='mark_dose_taken'),
]