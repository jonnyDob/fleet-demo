from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from commuters.views import EmployeeViewSet, EnrollmentViewSet, participation_report
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollment")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
    path("api/", include(router.urls)),
    path("api/reports/participation", participation_report),
]
