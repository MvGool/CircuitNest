from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status

from api.models import AvatarCosmetic, Cosmetic
from api.custom_serializers.cosmetic_serializers import AvatarCosmeticSerializer, CosmeticSerializer, PersonalCosmeticSerializer
from api.custom_serializers.achievement_serializers import AchievementSerializer
from api.helper import check_cosmetic_achievements


class CosmeticViewSet(ModelViewSet):
    http_method_names = ['get']
    permission_classes = [IsAuthenticated]
    serializer_class = CosmeticSerializer

    def get_queryset(self):
        queryset = Cosmetic.objects.all()
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    @action(methods=['get'], detail=False, name='get personal cosmetics', permission_classes=[IsAuthenticated])
    def personal(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = PersonalCosmeticSerializer(queryset, many=True, context={'request': request})

        return Response(serializer.data)


class AvatarCosmeticViewSet(ModelViewSet):
    http_method_names = ['post', 'patch']
    permission_classes = [IsAuthenticated]
    serializer_class = AvatarCosmeticSerializer

    def get_queryset(self):
        queryset = AvatarCosmetic.objects.filter(avatar__user_id=self.request.user.id)
        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data
        data['avatar'] = request.user.avatar.id
        data['unlocked'] = False
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        instance = AvatarCosmetic.objects.filter(avatar__user_id=request.user.id, cosmetic_id=kwargs['pk']).first()
        serializer = self.get_serializer(instance,
                                         data=request.data,
                                         partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        achievements = check_cosmetic_achievements(request.user.id)
        achievement_serializer = AchievementSerializer(achievements, many=True)

        data = {}
        data['response'] = serializer.data
        data['achievements'] = achievement_serializer.data

        return Response(data, status=status.HTTP_200_OK)
