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
    lobby_summary,
    start_commute_session,
    finish_commute_session,
    hr_dashboard,
    employee_dashboard,
    select_commute_option,
)

router = DefaultRouter()
router.register(r"employees", EmployeeViewSet, basename="employees")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollments")
router.register(r"options", CommuteOptionViewSet, basename="options")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),

    path("api/reports/participation", participation_report),

    # Commute game endpoints
    path("api/commute/lobby/", lobby_summary),
    path("api/commute/sessions/start/", start_commute_session),
    path(
        "api/commute/sessions/<int:pk>/finish/",
        finish_commute_session,
    ),

    # NEW: HR + Employee dashboards for the Fleet game demo
    path("api/hr/dashboard/", hr_dashboard),
    path("api/employee/dashboard/", employee_dashboard),
    path("api/employee/commute/select/", select_commute_option),

    # JWT auth
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]
