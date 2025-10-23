# commuters/views.py
from rest_framework import viewsets, permissions, status as drf_status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Employee, Enrollment, CommuteOption
from .serializers import EmployeeSerializer, EnrollmentSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().select_related("employee", "option")
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    # allow /api/enrollments/?status=active
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
