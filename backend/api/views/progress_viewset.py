from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Progress, ScenarioProgress
from api.custom_serializers.progress_serializers import ProgressSerializer, ScenarioProgressSerializer


class ProgressViewSet(ModelViewSet):
    http_method_names = ['get']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Progress.objects\
            .filter(scenario_id=self.kwargs.get('scenario_pk'))\
            .filter(user_id=self.request.user.id)
        return queryset

    def get_serializer_class(self):
        # if self.request.method == 'POST':
        #     return CreateUpdateProgressSerializer
        return ProgressSerializer

    def get_serializer_context(self):
        return {'scenario_id': self.kwargs.get('scenario_pk'), 'sender_id': self.request.user.id}


class ScenarioProgressViewSet(ModelViewSet):
    http_method_names = ['get']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ScenarioProgress.objects\
            .filter(user_id=self.request.user.id)
        return queryset

    def get_serializer_class(self):
        # if self.request.method == 'POST':
        #     return CreateUpdateProgressSerializer
        return ScenarioProgressSerializer

    def get_serializer_context(self):
        return {'scenario_id': self.kwargs.get('scenario_pk'), 'sender_id': self.request.user.id}
