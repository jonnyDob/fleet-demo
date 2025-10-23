from rest_framework import serializers
from .models import Employee, Enrollment

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta: model = Employee; fields = "__all__"

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta: model = Enrollment; fields = "__all__"
