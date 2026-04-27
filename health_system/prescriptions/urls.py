from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_prescription, name='create_prescription'),
    path('queue', views.get_prescription_queue, name='get_prescription_queue'),
    path('doctor/<int:doctor_id>', views.get_doctor_prescriptions, name='get_doctor_prescriptions'),
    path('<int:id>/dosage', views.add_dosage, name='add_dosage'),
    path('all', views.get_all_prescriptions, name='get_all_prescriptions'),
]