from rest_framework.routers import DefaultRouter
from .views import WellnessLogViewSet

router = DefaultRouter()
router.register("", WellnessLogViewSet, basename="wellness")

urlpatterns = router.urls
