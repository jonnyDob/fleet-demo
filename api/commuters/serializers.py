# api/commuters/serializers.py
from rest_framework import serializers
from .models import Employee, Enrollment, CommuteOption

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["id", "name", "email", "department", "status"]

class CommuteOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommuteOption
        fields = ["id", "name", "description", "active"]

class EnrollmentSerializer(serializers.ModelSerializer):
    # write with IDs; keep output simple (ids)
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all())
    option = serializers.PrimaryKeyRelatedField(queryset=CommuteOption.objects.all())

    class Meta:
        model = Enrollment
        fields = ["id", "employee", "option", "status", "created_at"]
