# api/commuters/admin.py

from django.contrib import admin
from .models import Employee, CommuteOption, Enrollment


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "department", "status")
    search_fields = ("name", "email", "department")
    list_filter = ("department", "status")


@admin.register(CommuteOption)
class CommuteOptionAdmin(admin.ModelAdmin):
    # was ("id", "type", "active") — 'type' no longer exists
    list_display = ("id", "name", "active")
    search_fields = ("name",)
    list_filter = ("active",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "employee", "option", "status", "created_at")
    list_filter = ("status", "option")
