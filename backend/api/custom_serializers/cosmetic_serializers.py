from rest_framework import serializers

from api.models import AvatarCosmetic, Cosmetic


class CosmeticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cosmetic
        fields = ['id', 'name', 'slot', 'visual']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation


class PersonalCosmeticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cosmetic
        fields = ['id', 'name', 'slot', 'visual']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.avatarcosmetic_set.filter(avatar=self.context['request'].user.avatar).exists():
            representation['unlocked'] = instance.avatarcosmetic_set.get(avatar=self.context['request'].user.avatar).unlocked
            representation['equipped'] = instance.avatarcosmetic_set.get(avatar=self.context['request'].user.avatar).equipped
        else:
            representation['unlocked'] = False
            representation['equipped'] = False
        return representation


class AvatarCosmeticSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvatarCosmetic
        fields = ['avatar', 'cosmetic', 'unlocked', 'equipped']
