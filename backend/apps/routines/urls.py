from rest_framework.routers import DefaultRouter
from .views import RoutineViewSet, RoutineExerciseViewSet

router = DefaultRouter()
router.register("routine-exercises", RoutineExerciseViewSet, basename="routine-exercise")
router.register("", RoutineViewSet, basename="routine")

urlpatterns = router.urls
