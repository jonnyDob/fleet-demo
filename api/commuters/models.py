from django.conf import settings
from django.db import models


class Office(models.Model):
    """
    A physical office where people commute to.
    We also hang some 'baseline' numbers off this for the demo calculations.
    """

    name = models.CharField(max_length=120)
    city = models.CharField(max_length=120, blank=True)
    address = models.CharField(max_length=255, blank=True)

    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    # Demo-friendly fields for money / CO2 calculations
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # "Drive alone" baseline assumptions
    baseline_monthly_cost = models.DecimalField(
        max_digits=8, decimal_places=2, default=300
    )
    baseline_co2_kg_per_month = models.DecimalField(
        max_digits=8, decimal_places=1, default=220
    )

    # Employer payroll tax rate on pre-tax benefits (e.g. 7.65%)
    payroll_tax_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=7.65
    )

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return self.name


class HRProfile(models.Model):
    """
    Minimal link between an HR user and an office.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="hr_profile",
    )
    office = models.ForeignKey(
        Office,
        on_delete=models.CASCADE,
        related_name="hr_profiles",
    )

    def __str__(self) -> str:
        return f"HR for {self.office.name} ({self.user.username})"


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

    # NEW: which office this employee belongs to
    office = models.ForeignKey(
        Office,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )

    # NEW: very rough "where do you live" for the demo
    home_postal_code = models.CharField(max_length=20, blank=True)

    # NEW: what commute option they are currently using in the game
    preferred_option = models.ForeignKey(
        "CommuteOption",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="preferred_by",
    )

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

    # NEW: demo numbers for costs and CO2
    monthly_cost_before_tax = models.DecimalField(
        max_digits=8, decimal_places=2, default=0
    )
    monthly_cost_after_tax = models.DecimalField(
        max_digits=8, decimal_places=2, default=0
    )
    co2_kg_per_month = models.DecimalField(
        max_digits=8, decimal_places=1, default=0
    )

    # NEW: how many "game points" one completed commute is worth
    points_per_session = models.IntegerField(default=20)

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


class Reward(models.Model):
    """
    Rewards that HR configures for the office, both individual and team.
    """

    TYPE_CHOICES = [
        ("individual", "Individual"),
        ("team", "Team"),
    ]

    office = models.ForeignKey(
        Office,
        on_delete=models.CASCADE,
        related_name="rewards",
    )
    name = models.CharField(max_length=120)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    target_points = models.IntegerField(default=0)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_type_display()})"
