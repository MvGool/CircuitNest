from rest_framework import serializers

from api.models import Avatar, Cosmetic
from api.custom_serializers.cosmetic_serializers import CosmeticSerializer


class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avatar
        fields = ['id', 'user', 'color_palette']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        id_list = instance.avatarcosmetic_set.filter(equipped=True).values_list('cosmetic', flat=True)
        cosmetic_list = Cosmetic.objects.filter(id__in=id_list)
        representation['cosmetics'] = CosmeticSerializer(cosmetic_list, many=True).data
        return representation
