# api/commuters/views.py
from rest_framework import viewsets, permissions, status as drf_status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Employee, Enrollment, CommuteOption
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
        return Response(self.get_serializer(enrollment).data, status=drf_status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def participation_report(request):
    total = Employee.objects.count()
    active = Enrollment.objects.filter(status="active").values("employee").distinct().count()
    rate = round((active / total) * 100, 2) if total else 0.0
    return Response({"participationRate": rate, "activeEnrollments": active})
