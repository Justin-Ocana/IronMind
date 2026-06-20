from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import LoginView, LogoutView
from common.views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", HealthCheckView.as_view()),
    path("api/v1/auth/login/", LoginView.as_view()),
    path("api/v1/auth/refresh/", TokenRefreshView.as_view()),
    path("api/v1/auth/logout/", LogoutView.as_view()),
    path("api/v1/users/", include("apps.users.urls")),
    path("api/v1/exercises/", include("apps.exercises.urls")),
    path("api/v1/routines/", include("apps.routines.urls")),
    path("api/v1/workouts/", include("apps.workouts.urls")),
    path("api/v1/body/", include("apps.body.urls")),
    path("api/v1/wellness/", include("apps.wellness.urls")),
    path("api/v1/reports/", include("apps.reports.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
