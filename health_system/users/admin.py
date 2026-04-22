from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, PatientProfile


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'role', 'is_staff')

admin.site.register(User, CustomUserAdmin)  # ← was UserAdmin, now CustomUserAdmin
admin.site.register(PatientProfile)