from django.urls import path
from . import views

urlpatterns = [
    path('users', views.get_all_users, name='get_all_users'),
    path('users/<int:id>/status', views.update_user_status, name='update_user_status'),
]