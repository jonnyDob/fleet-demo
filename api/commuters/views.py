# api/commuters/views.py
from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from rest_framework import viewsets, permissions, status as drf_status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Employee, Enrollment, CommuteOption, CommuteSession
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
# NEW: Commute game endpoints
# --------------------------------------------------------------------


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
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

    # Fake coworkers: just list some active employees with a simple status
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
@permission_classes([permissions.IsAuthenticated])
def start_commute_session(request):
    """
    Start a new commute session for the demo.

    For v1, we just pick a single demo employee to attach sessions to.
    Later, you can map request.user -> Employee.
    """
    demo_employee = (
        Employee.objects.filter(status="active").order_by("id").first()
    )
    if not demo_employee:
        return Response(
            {"detail": "No employees seeded yet."},
            status=drf_status.HTTP_400_BAD_REQUEST,
        )

    session = CommuteSession.objects.create(employee=demo_employee)
    return Response(
        {"id": session.id, "status": session.status},
        status=drf_status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
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
