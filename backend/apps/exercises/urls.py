from rest_framework.routers import DefaultRouter
from .views import MuscleGroupViewSet, ExerciseViewSet

router = DefaultRouter()
router.register("muscle-groups", MuscleGroupViewSet, basename="muscle-group")
router.register("", ExerciseViewSet, basename="exercise")

urlpatterns = router.urls
