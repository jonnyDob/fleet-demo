# api/core/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from commuters.views import (
    EmployeeViewSet,
    EnrollmentViewSet,
    CommuteOptionViewSet,
    participation_report,
)

router = DefaultRouter()
router.register(r"employees", EmployeeViewSet, basename="employees")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollments")
router.register(r"options", CommuteOptionViewSet, basename="options")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/reports/participation", participation_report),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
