from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Employee, CommuteOption, Enrollment

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "department", "status")
    search_fields = ("name", "email", "department")
    list_filter = ("department", "status")

@admin.register(CommuteOption)
class CommuteOptionAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "active")
    list_filter = ("active",)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "employee", "option", "status", "created_at")
    list_filter = ("status", "option")
