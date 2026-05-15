from django.urls import path
from . import views
from appointments import views as appointment_views
from schedules import views as schedule_views

urlpatterns = [
    path('search', views.search_patient, name='search_patient'),
    path('<int:id>/prescriptions', views.get_patient_prescriptions, name='get_patient_prescriptions'),
    path('<int:id>/renewals', appointment_views.book_renewal, name='book_renewal'),
    path('<int:id>/medications/today', schedule_views.get_today_medications, name='get_today_medications'),
    path('<int:id>/schedule', schedule_views.get_patient_schedule, name='get_patient_schedule'),
]