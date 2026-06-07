from django.urls import path
from . import views

urlpatterns = [
    path('profile', views.update_profile, name='update_profile'),
    path('password', views.update_password, name='update_password'),
    path('profile/picture', views.upload_profile_picture, name='upload_profile_picture'),
]
