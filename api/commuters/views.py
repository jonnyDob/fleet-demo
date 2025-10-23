from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Employee, Enrollment
from .serializers import EmployeeSerializer, EnrollmentSerializer

class EmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EmployeeSerializer
    def get_queryset(self):
        qs = Employee.objects.all().order_by("id")
        dept = self.request.query_params.get("department")
        status_q = self.request.query_params.get("status")
        if dept: qs = qs.filter(department=dept)
        if status_q: qs = qs.filter(status=status_q)
        return qs

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().order_by("-id")
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def participation_report(request):
    total = Employee.objects.count()
    active = Enrollment.objects.filter(status="active").count()
    rate = round((active/total)*100, 1) if total else 0.0
    return Response({"participationRate": rate, "activeEnrollments": active})
