# api/commuters/views.py
from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Sum
from django.utils import timezone

from rest_framework import viewsets, permissions, status as drf_status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import (
    Employee,
    Enrollment,
    CommuteOption,
    CommuteSession,
    Office,
    Reward,
)
from .serializers import (
    EmployeeSerializer,
    EnrollmentSerializer,
    CommuteOptionSerializer,
)


class EmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Employee.objects.all().order_by("id")
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    # /api/employees/?department=Engineering
    def get_queryset(self):
        qs = super().get_queryset()
        dep = self.request.query_params.get("department")
        if dep:
            qs = qs.filter(department=dep)
        return qs


class CommuteOptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CommuteOption.objects.filter(active=True).order_by("id")
    serializer_class = CommuteOptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().select_related("employee", "option")
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    # /api/enrollments/?status=active
    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    # POST /api/enrollments/{id}/cancel/
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        enrollment = self.get_object()
        if enrollment.status != "canceled":
            enrollment.status = "canceled"
            enrollment.save(update_fields=["status"])
        return Response(
            self.get_serializer(enrollment).data,
            status=drf_status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def participation_report(request):
    """
    Original report endpoint used by the existing demo dashboard.
    """
    total = Employee.objects.count()
    active = (
        Enrollment.objects.filter(status="active")
        .values("employee")
        .distinct()
        .count()
    )
    rate = round((active / total) * 100, 2) if total else 0.0
    return Response(
        {"participationRate": rate, "activeEnrollments": active}
    )


# --------------------------------------------------------------------
# Commute game endpoints (demo-friendly, no auth required)
# --------------------------------------------------------------------


@api_view(["GET"])
@permission_classes([permissions.AllowAny])  # open for demo
def lobby_summary(request):
    """
    Simple lobby summary for the demo.

    For v1 we assume a single office ("Toronto HQ") and use:
    - Employee.department as the "team"
    - CommuteSession as runs for this office
    """
    today = timezone.now().date()
    start_of_week = today - timedelta(days=today.weekday())

    # Completed sessions
    runs_today = CommuteSession.objects.filter(
        date=today, status="completed"
    ).count()
    runs_this_week = CommuteSession.objects.filter(
        date__gte=start_of_week, status="completed"
    ).count()

    # Team totals (department == team)
    team_rows = (
        CommuteSession.objects.filter(date__gte=start_of_week, status="completed")
        .values("employee__department")
        .annotate(runs=Count("id"))
        .order_by("-runs")
    )
    team_totals = [
        {
            "team": row["employee__department"] or "Unassigned",
            "runsThisWeek": row["runs"],
        }
        for row in team_rows
    ]

    # Fake coworkers: list some active employees with a simple status
    employees = list(
        Employee.objects.filter(status="active").order_by("id")[:12]
    )
    status_cycle = [
        "In the lobby ☕",
        "Starting my commute 🚋",
        "Already on the way 🚶",
        "WFH today 🏠",
    ]
    coworkers = []
    for idx, emp in enumerate(employees):
        coworkers.append(
            {
                "name": emp.name,
                "team": emp.department or "General",
                "status": status_cycle[idx % len(status_cycle)],
            }
        )

    payload = {
        "officeName": "Toronto HQ",
        "runsToday": runs_today,
        "runsThisWeek": runs_this_week,
        "teamTotals": team_totals,
        "coworkers": coworkers,
    }
    return Response(payload, status=drf_status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])  # open for demo
def start_commute_session(request):
    """
    Start a new commute session for the demo.

    We pick or create a single demo employee to attach sessions to.
    Later, you can map request.user -> Employee properly.
    """
    demo_employee, _created = Employee.objects.get_or_create(
        email="demo@fleetdemo.com",
        defaults={
            "name": "Demo Commuter",
            "department": "Engineering",
            "status": "active",
        },
    )

    session = CommuteSession.objects.create(employee=demo_employee)
    return Response(
        {"id": session.id, "status": session.status},
        status=drf_status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])  # open for demo
def finish_commute_session(request, pk: int):
    """
    Mark a commute session as completed and award fixed points.
    """
    try:
        session = CommuteSession.objects.get(pk=pk)
    except CommuteSession.DoesNotExist:
        return Response(
            {"detail": "Session not found."},
            status=drf_status.HTTP_404_NOT_FOUND,
        )

    if session.status != "completed":
        session.status = "completed"
        session.points_earned = 35  # fixed for demo
        session.save(update_fields=["status", "points_earned"])

    return Response(
        {
            "id": session.id,
            "status": session.status,
            "points": session.points_earned,
        },
        status=drf_status.HTTP_200_OK,
    )


# --------------------------------------------------------------------
# NEW helper functions for the HR + Employee dashboards
# --------------------------------------------------------------------


def _get_demo_office() -> Office:
    office = Office.objects.first()
    if office:
        return office
    # Fallback in case seed_demo wasn't run yet
    return Office.objects.create(
        name="Fleet Toronto HQ",
        city="Toronto",
        address="123 Demo Street",
        monthly_budget=Decimal("5000.00"),
        baseline_monthly_cost=Decimal("300.00"),
        baseline_co2_kg_per_month=Decimal("220.0"),
        payroll_tax_rate=Decimal("7.65"),
    )


def _get_employee_for_request(request) -> Employee:
    """
    Try to map request.user -> Employee, otherwise fall back
    to the seeded demo employee.
    """
    if request.user and request.user.is_authenticated:
        emp = (
            Employee.objects.select_related("preferred_option", "office")
            .filter(user=request.user)
            .first()
        )
        if emp:
            return emp

    # Fallback to the main seeded demo employee
    emp = (
        Employee.objects.select_related("preferred_option", "office")
        .filter(email="employee@fleetdemo.com")
        .first()
    )
    if emp:
        return emp

    # Last resort: create a barebones demo employee
    office = _get_demo_office()
    return Employee.objects.create(
        name="Demo Employee",
        email="demo.employee@fleetdemo.com",
        department="Engineering",
        status="active",
        office=office,
    )


# --------------------------------------------------------------------
# NEW HR dashboard endpoint
# --------------------------------------------------------------------


@api_view(["GET"])
@permission_classes([permissions.AllowAny])  # open for demo
def hr_dashboard(request):
    """
    HR dashboard: aggregate money + CO2 savings and reward progress
    for a single office (demo: Fleet Toronto HQ).
    """
    office = _get_demo_office()

    employees_qs = (
        office.employees.select_related("preferred_option")
        .filter(status="active")
    )
    total_employees = employees_qs.count()
    participating_employees = employees_qs.filter(
        preferred_option__isnull=False
    ).count()

    payroll_tax_rate = office.payroll_tax_rate or Decimal("7.65")
    baseline_co2 = office.baseline_co2_kg_per_month or Decimal("220.0")

    # Aggregate savings
    total_pre_tax_spend = Decimal("0")
    employer_savings = Decimal("0")
    total_co2_saved = Decimal("0")

    for emp in employees_qs:
        opt = emp.preferred_option
        if not opt:
            continue

        total_pre_tax_spend += opt.monthly_cost_before_tax
        employer_savings += (
            opt.monthly_cost_before_tax * payroll_tax_rate / Decimal("100.0")
        )

        co2_saved = max(
            Decimal("0"), baseline_co2 - opt.co2_kg_per_month
        )
        total_co2_saved += co2_saved

    # Fake chart data for last 6 months (just ramping up)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    monthly_money = []
    monthly_co2 = []

    base_money = employer_savings or Decimal("300.0")
    base_co2_val = total_co2_saved or Decimal("800.0")

    for i, month in enumerate(months, start=1):
        monthly_money.append(
            {
                "month": month,
                "amount": float(base_money * Decimal(i) / Decimal(len(months))),
            }
        )
        monthly_co2.append(
            {
                "month": month,
                "kg": float(base_co2_val * Decimal(i) / Decimal(len(months))),
            }
        )

    # Reward progress based on total points earned by employees at this office
    total_points = (
        CommuteSession.objects.filter(
            employee__office=office,
            status="completed",
        ).aggregate(total=Sum("points_earned"))["total"]
        or 0
    )

    rewards_data = []
    for reward in office.rewards.all():
        if reward.target_points:
            progress = min(
                100, int((total_points / reward.target_points) * 100)
            )
        else:
            progress = 0

        rewards_data.append(
            {
                "id": reward.id,
                "name": reward.name,
                "type": reward.type,
                "description": reward.description,
                "targetPoints": reward.target_points,
                "currentPoints": total_points,
                "progressPercent": progress,
            }
        )

    participation_rate = (
        round((participating_employees / total_employees) * 100, 1)
        if total_employees
        else 0
    )

    payload = {
        "office": {
            "id": office.id,
            "name": office.name,
            "city": office.city,
            "address": office.address,
            "monthlyBudget": float(office.monthly_budget),
        },
        "summary": {
            "totalEmployees": total_employees,
            "participatingEmployees": participating_employees,
            "participationRate": participation_rate,
            "payrollTaxRate": float(payroll_tax_rate),
            "totalPreTaxSpend": float(total_pre_tax_spend),
            "estimatedEmployerSavingsMonthly": float(employer_savings),
            "estimatedEmployerSavingsYearly": float(
                employer_savings * Decimal("12")
            ),
            "totalCo2SavedMonthlyKg": float(total_co2_saved),
            "totalCo2SavedYearlyKg": float(
                total_co2_saved * Decimal("12")
            ),
        },
        "charts": {
            "moneySavedByMonth": monthly_money,
            "co2SavedByMonth": monthly_co2,
        },
        "rewards": rewards_data,
    }
    return Response(payload, status=drf_status.HTTP_200_OK)


# --------------------------------------------------------------------
# NEW Employee dashboard endpoint
# --------------------------------------------------------------------


@api_view(["GET"])
@permission_classes([permissions.AllowAny])  # open for demo
def employee_dashboard(request):
    """
    Employee view: commute options, personal savings, reward progress.
    Uses either the logged-in user or the seeded demo employee.
    """
    employee = _get_employee_for_request(request)
    office = employee.office or _get_demo_office()

    options_qs = CommuteOption.objects.filter(active=True).order_by("id")
    selected_id = employee.preferred_option_id

    baseline_co2 = office.baseline_co2_kg_per_month or Decimal("220.0")
    payroll_tax_rate = office.payroll_tax_rate or Decimal("7.65")

    # Personal savings
    monthly_savings = Decimal("0")
    yearly_savings = Decimal("0")
    co2_saved_monthly = Decimal("0")
    co2_saved_yearly = Decimal("0")

    if employee.preferred_option:
        opt = employee.preferred_option
        monthly_savings = (
            opt.monthly_cost_before_tax * payroll_tax_rate / Decimal("100.0")
        )
        yearly_savings = monthly_savings * Decimal("12")

        co2_saved_monthly = max(
            Decimal("0"), baseline_co2 - opt.co2_kg_per_month
        )
        co2_saved_yearly = co2_saved_monthly * Decimal("12")

    # Simple progress based on number of completed sessions
    completed_sessions = employee.commute_sessions.filter(
        status="completed"
    ).count()
    individual_goal_sessions = 10
    team_goal_sessions = 100

    individual_progress = min(
        100,
        int((completed_sessions / individual_goal_sessions) * 100)
        if individual_goal_sessions
        else 0,
    )

    office_sessions = CommuteSession.objects.filter(
        employee__office=office,
        status="completed",
    ).count()
    team_progress = min(
        100,
        int((office_sessions / team_goal_sessions) * 100)
        if team_goal_sessions
        else 0,
    )

    # 7-day chart for personal savings (fake but consistent)
    today = timezone.now().date()
    daily_money = []
    daily_co2 = []

    for days_ago in range(6, -1, -1):
        day = today - timedelta(days=days_ago)
        sessions_on_day = employee.commute_sessions.filter(
            date=day, status="completed"
        ).count()

        if sessions_on_day and monthly_savings:
            money_saved = float(
                (monthly_savings / Decimal("20")) * sessions_on_day
            )
            co2_saved = float(
                (co2_saved_monthly / Decimal("20")) * sessions_on_day
            )
        else:
            money_saved = 0.0
            co2_saved = 0.0

        daily_money.append({"date": day.isoformat(), "amount": money_saved})
        daily_co2.append({"date": day.isoformat(), "kg": co2_saved})

    options_payload = []
    for opt in options_qs:
        options_payload.append(
            {
                "id": opt.id,
                "name": opt.name,
                "description": opt.description,
                "active": opt.active,
                "monthlyCostBeforeTax": float(opt.monthly_cost_before_tax),
                "monthlyCostAfterTax": float(opt.monthly_cost_after_tax),
                "co2KgPerMonth": float(opt.co2_kg_per_month),
                "selected": opt.id == selected_id,
            }
        )

    payload = {
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "department": employee.department,
            "homePostalCode": employee.home_postal_code,
        },
        "office": {
            "id": office.id,
            "name": office.name,
            "city": office.city,
        },
        "commuteOptions": options_payload,
        "stats": {
            "moneySavedMonthly": float(monthly_savings),
            "moneySavedYearly": float(yearly_savings),
            "co2SavedMonthlyKg": float(co2_saved_monthly),
            "co2SavedYearlyKg": float(co2_saved_yearly),
        },
        "progress": {
            "individualReward": {
                "label": "Individual reward progress",
                "percent": individual_progress,
            },
            "teamReward": {
                "label": "Team reward progress",
                "percent": team_progress,
            },
        },
        "charts": {
            "dailyMoneySaved": daily_money,
            "dailyCo2Saved": daily_co2,
        },
    }
    return Response(payload, status=drf_status.HTTP_200_OK)


# --------------------------------------------------------------------
# NEW endpoint: employee selects commute option
# --------------------------------------------------------------------


@api_view(["POST"])
@permission_classes([permissions.AllowAny])  # open for demo
def select_commute_option(request):
    """
    Employee picks a commute option for the game.
    We store it as their preferred_option and award one completed session.
    """
    employee = _get_employee_for_request(request)
    option_id = request.data.get("optionId") or request.data.get("option_id")

    if not option_id:
        return Response(
            {"detail": "optionId is required."},
            status=drf_status.HTTP_400_BAD_REQUEST,
        )

    try:
        option = CommuteOption.objects.get(pk=option_id, active=True)
    except CommuteOption.DoesNotExist:
        return Response(
            {"detail": "Invalid option."},
            status=drf_status.HTTP_404_NOT_FOUND,
        )

    employee.preferred_option = option
    employee.save(update_fields=["preferred_option"])

    # For the demo, also create a completed session to move the stats
    session = CommuteSession.objects.create(
        employee=employee,
        status="completed",
        points_earned=option.points_per_session,
    )

    return Response(
        {
            "employeeId": employee.id,
            "selectedOptionId": option.id,
            "sessionId": session.id,
        },
        status=drf_status.HTTP_200_OK,
    )
