from rest_framework import viewsets, filters
from django.db.models import Q
from .models import MuscleGroup, Exercise
from .serializers import MuscleGroupSerializer, ExerciseSerializer


class MuscleGroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MuscleGroup.objects.all()
    serializer_class = MuscleGroupSerializer


class ExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = ExerciseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    def get_queryset(self):
        return Exercise.objects.filter(
            Q(user__isnull=True) | Q(user=self.request.user)
        ).select_related("muscle_group")

    def perform_destroy(self, instance):
        if not instance.is_custom or instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("No puedes eliminar ejercicios globales.")
        instance.delete()
