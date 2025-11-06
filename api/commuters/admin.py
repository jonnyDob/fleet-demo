from django.contrib import admin
from .models import Employee, CommuteOption, Enrollment, Office, HRProfile, Reward


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "department", "status", "office")
    search_fields = ("name", "email", "department")
    list_filter = ("department", "status", "office")


@admin.register(CommuteOption)
class CommuteOptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "active",
        "monthly_cost_before_tax",
        "monthly_cost_after_tax",
        "co2_kg_per_month",
    )
    search_fields = ("name",)
    list_filter = ("active",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "employee", "option", "status", "created_at")
    list_filter = ("status", "option")


@admin.register(Office)
class OfficeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "city", "monthly_budget", "payroll_tax_rate")
    search_fields = ("name", "city")


@admin.register(HRProfile)
class HRProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "office")


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "type", "office", "target_points")
    list_filter = ("type", "office")
