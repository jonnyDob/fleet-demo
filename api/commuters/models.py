# api/commuters/models.py
from django.conf import settings
from django.db import models


class Employee(models.Model):
    """
    Core person in the system. Optionally linked to a Django auth user
    so you can map logins -> employees later.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee_profile",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=20, default="active")

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return self.name or self.email


class CommuteOption(models.Model):
    """
    Ways someone can commute (e.g. Go Train, Bike, TTC).
    The frontend / serializers expect: id, name, description, active.
    """

    name = models.CharField(max_length=80)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return self.name


class Enrollment(models.Model):
    """
    An employee enrolled into a particular commute option.
    Only one *active* enrollment per (employee, option).
    """

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    option = models.ForeignKey(
        CommuteOption,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "option", "status"],
                condition=models.Q(status="active"),
                name="uniq_active_enrollment_per_option",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.employee.name} – {self.option.name} – {self.status}"


class CommuteSession(models.Model):
    """
    One “run” of the commute game (or just a tracked commute).
    Used heavily by your /lobby and /start /finish endpoints.
    """

    STATUS_CHOICES = [
        ("in_progress", "In progress"),
        ("completed", "Completed"),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="commute_sessions",
    )
    date = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="in_progress",
    )
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.employee.name} – {self.date} – {self.status}"
