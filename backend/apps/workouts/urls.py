from rest_framework.routers import DefaultRouter
from .views import WorkoutSessionViewSet, SetLogViewSet

router = DefaultRouter()
router.register("sessions", WorkoutSessionViewSet, basename="workout-session")
router.register("sets", SetLogViewSet, basename="set-log")

urlpatterns = router.urls
