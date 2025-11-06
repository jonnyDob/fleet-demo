from rest_framework import serializers
from .models import (
    Employee,
    Enrollment,
    CommuteOption,
    Office,
    Reward,
)


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ["id", "name", "city", "address"]


class EmployeeSerializer(serializers.ModelSerializer):
    office = OfficeSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "name",
            "email",
            "department",
            "status",
            "home_postal_code",
            "office",
        ]


class CommuteOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommuteOption
        fields = [
            "id",
            "name",
            "description",
            "active",
            "monthly_cost_before_tax",
            "monthly_cost_after_tax",
            "co2_kg_per_month",
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    # write with IDs; keep output simple (ids)
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all())
    option = serializers.PrimaryKeyRelatedField(queryset=CommuteOption.objects.all())

    class Meta:
        model = Enrollment
        fields = ["id", "employee", "option", "status", "created_at"]


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ["id", "name", "type", "description", "target_points"]
