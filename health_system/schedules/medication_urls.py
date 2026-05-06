from django.urls import path
from . import views

urlpatterns = [
    path('<int:medicationId>/taken', views.mark_dose_taken, name='mark_dose_taken'),
]