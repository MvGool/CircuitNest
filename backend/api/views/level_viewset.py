from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response

from api.models import ExerciseLevel, Level, Progress
from api.custom_serializers.level_serializers import LevelPolymorphicSerializer, LevelSerializer


class LevelViewSet(ModelViewSet):
    http_method_names = ['get']
    serializer_class = LevelPolymorphicSerializer
    permission_classes = [DjangoModelPermissions]

    def get_serializer_class(self):
        return LevelSerializer

    def retrieve(self, request, *args, **kwargs):
        level = self.get_object()

        # get level queryset
        scenarioId = level.scenario.id
        level_queryset = Level.objects.filter(scenario_id=scenarioId).filter(active=True).filter(
            pk=level.id)

        # check if the class has gamification enabled
        if not level.scenario.class_related.gamified:
            # if not, only filter on the classroom
            level = level_queryset.filter(scenario__class_related_id=request.user.class_related).last()
            serializer = self.get_serializer(level)
            return Response(serializer.data)

        # check permission to access this level
        if request.user.is_staff:
            level_queryset = level_queryset.filter(scenario__class_related__owner_id=request.user.id)
        elif request.user.class_related:
            classroom_id = request.user.class_related
            level_queryset = level_queryset.filter(scenario__class_related_id=classroom_id)
        else:
            level_queryset = level_queryset.filter(scenario__class_related_id=None)

        level = level_queryset.last()

        if not level:
            return Response({"error": "level not found."}, status=status.HTTP_400_BAD_REQUEST)

        progress_queryset = Progress.objects\
                                    .filter(user_id=request.user.id)\
                                    .filter(level__in=level.prerequisites.all())

        if not (len(progress_queryset.all()) == len(level.prerequisites.all())):
            return Response({"error": "Don't have access to this level yet."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(level)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = Level.objects.filter(scenario_id=self.kwargs.get('scenario_pk')).filter(active=True).order_by(
            'number')
        if self.request.user.is_staff:
            queryset = queryset.filter(scenario__class_related__owner_id=self.request.user.id)
        elif self.request.user.class_related:
            classroom_id = self.request.user.class_related
            queryset = queryset.filter(scenario__class_related_id=classroom_id)
        else:
            queryset = queryset.filter(scenario__class_related_id=None)

        return queryset

    def get_serializer_context(self):
        return {'scenario_id': self.kwargs.get('scenario_pk'), 'sender_id': self.request.user.id}
