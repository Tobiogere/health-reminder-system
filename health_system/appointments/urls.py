from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_renewals, name='get_renewals'),
    path('<int:id>/approve', views.approve_renewal, name='approve_renewal'),
    path('<int:id>/reject', views.reject_renewal, name='reject_renewal'),
]