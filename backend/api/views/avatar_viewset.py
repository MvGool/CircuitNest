from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Avatar
from api.custom_serializers.avatar_serializers import AvatarSerializer


class AvatarViewSet(ModelViewSet):
    http_method_names = ['get', 'patch']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Avatar.objects.filter(user__class_related=self.request.user.class_related)
        return queryset

    def get_serializer_class(self):
        return AvatarSerializer
