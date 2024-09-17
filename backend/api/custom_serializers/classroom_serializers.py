from api.models import Classroom
from rest_framework import serializers
from api.custom_serializers.utils_serializers import UserSummarySerializer


class ClassroomSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer()

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'owner', 'description', 'code', 'gamified', 'active']
