from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import DjangoModelPermissions

from api.models import Scenario
from api.custom_serializers.scenario_serializers import ScenarioSerializer


class ScenarioViewSet(ModelViewSet):
    http_method_names = ['get']
    serializer_class = ScenarioSerializer
    permission_classes = [DjangoModelPermissions]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"sender_id": self.request.user.id})
        return context

    def get_queryset(self):
        queryset = Scenario.objects.filter(active=True)
        # Enable this to see all scenarios in classrooms you own
        # if self.request.user.is_staff:
        #     queryset = queryset.filter(class_related__owner_id=self.request.user.id)
        if self.request.user.class_related:
            classroom_id = self.request.user.class_related
            queryset = queryset.filter(class_related_id=classroom_id)
        else:
            queryset = queryset.filter(class_related=None)
        return queryset
