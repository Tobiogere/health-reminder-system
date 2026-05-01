from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_drugs, name='get_drugs'),
    path('suggest', views.suggest_drug, name='suggest_drug'),
    path('suggestions', views.get_drug_suggestions, name='get_drug_suggestions'),
    path('<int:id>/approve', views.approve_drug, name='approve_drug'),
    path('<int:id>/reject', views.reject_drug, name='reject_drug'),
]