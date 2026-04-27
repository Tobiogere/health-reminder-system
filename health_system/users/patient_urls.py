from django.urls import path
from . import views
from appointments import views as appointment_views

urlpatterns = [
    path('<str:identifier>', views.search_patient, name='search_patient'),
    path('<int:id>/prescriptions', views.get_patient_prescriptions, name='get_patient_prescriptions'),
    path('<int:id>/renewals', appointment_views.book_renewal, name='book_renewal'),
]