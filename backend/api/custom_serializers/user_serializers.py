from djoser.serializers import UserSerializer as BaseUserSerializer, UserCreateSerializer as BaseUserCreateSerializer
from rest_framework import serializers

from .avatar_serializers import AvatarSerializer
from .classroom_serializers import ClassroomSerializer
from api.models import Classroom
from rest_framework_simplejwt.tokens import RefreshToken


class UserCreateSerializer(BaseUserCreateSerializer):
    code = serializers.CharField(max_length=10, required=False, allow_blank=True, write_only=True)
    token = serializers.SerializerMethodField(method_name='get_token')

    class Meta(BaseUserCreateSerializer.Meta):
        fields = ['id', 'username', 'password',
                  'email', 'first_name', 'last_name', 'code', 'token']

    def validate(self, attrs):
        code_value = attrs.pop('code', None)
        custom_attrs = super().validate(attrs)

        # Now you can add 'code' back to the validation array
        if code_value is not None:
            custom_attrs['code'] = code_value

        return custom_attrs

    def create(self, validated_data):
        class_related_code = validated_data.pop('code', None)
        if class_related_code:
            try:
                classroom = Classroom.objects.get(code=class_related_code)
                validated_data['class_related'] = classroom
            except Classroom.DoesNotExist:
                raise serializers.ValidationError("Classroom with provided code does not exist.")

        return self.perform_create(validated_data)

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class UserSerializer(BaseUserSerializer):
    score = serializers.IntegerField(read_only=True)
    class_related = ClassroomSerializer(read_only=True)
    avatar = AvatarSerializer(read_only=True)

    class Meta(BaseUserSerializer.Meta):
        ref_name = 'CustomUser'
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'score', 'class_related', 'tutorial', 'language', 'avatar']
