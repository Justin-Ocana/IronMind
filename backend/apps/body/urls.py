from rest_framework.routers import DefaultRouter
from .views import BodyWeightViewSet, BodyMeasurementViewSet, BodyPhotoViewSet

router = DefaultRouter()
router.register("weight", BodyWeightViewSet, basename="body-weight")
router.register("measurements", BodyMeasurementViewSet, basename="body-measurement")
router.register("photos", BodyPhotoViewSet, basename="body-photo")

urlpatterns = router.urls
