# api/commuters/models.py
from django.db import models


class Employee(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=20, default="active")


class CommuteOption(models.Model):
    type = models.CharField(max_length=20)
    active = models.BooleanField(default=True)


class Enrollment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    option = models.ForeignKey(CommuteOption, on_delete=models.CASCADE)
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
        
class CommuteSession(models.Model):
    STATUS_CHOICES = [
        ("in_progress", "In progress"),
        ("completed", "Completed"),
    ]

    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="commute_sessions"
    )
    date = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="in_progress"
    )
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.employee.name} – {self.date} – {self.status}"
