import json
from rest_framework import mixins, status
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models import Achievement, AchievementCondition, UserAchievement
from api.custom_serializers.achievement_serializers import AchievementConditionSerializer, AchievementSerializer, UserAchievementSerializer


class AchievementViewSet(ModelViewSet):
    http_method_names = ['get']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Achievement.objects.all().filter(class_related=self.request.user.class_related)
        return queryset

    def get_serializer_class(self):
        return AchievementSerializer


class UserAchievementViewSet(mixins.ListModelMixin, GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = UserAchievement.objects.filter(user_id=self.request.user.id, achievement__class_related=self.request.user.class_related)
        return queryset

    def get_serializer_class(self):
        return UserAchievementSerializer

    @action(detail=False, methods=['post'], name='earn achievement', permission_classes=[IsAuthenticated])
    def earn_achievement(self, request, *args, **kwargs):
        user = request.user

        if request.data.get('type') == 'tutorial_completion':
            achievement = Achievement.objects.filter(condition__condition_type=AchievementCondition.AchievementConditionType.TUTORIAL_COMPLETION, class_related=user.class_related).first()
            UserAchievement.objects.create(user=user, achievement=achievement)
            serializer = AchievementSerializer(achievement)

            return Response({'msg': 'Achievement unlocked', 'achievements': serializer.data}, status=200)

        elif request.data.get('type') == 'cosmetics_equipped':
            num_cosmetics = request.data.get('num_cosmetics')
            achievements = Achievement.objects.filter(condition__condition_type=AchievementCondition.AchievementConditionType.COSMETICS_EQUIPPED, class_related=user.class_related, condition__cosmetics_equipped__gte=num_cosmetics)

            if len(achievements) == 0:
                return Response({'msg': 'No achievement to give for this type'}, status=200)

            for achievement in achievements:
                UserAchievement.objects.create(user=user, achievement=achievement)
            serializer = AchievementSerializer(achievements, many=True)

            return Response({'msg': 'Achievement unlocked', 'achievements': serializer.data}, status=200)

        return Response({'msg': 'No achievement to give for this type'}, status=200)


class MassCreateAchievements(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        # Check if the request contains a file
        if 'achievement' in request.FILES:
            uploaded_file = request.FILES['achievement']
            try:
                # Try to load and parse the JSON data
                json_data = json.load(uploaded_file)
            except json.JSONDecodeError:
                return Response({'error': 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)

            resp = self.parse_achievement_data(json_data)
            if 'error' in resp:
                return Response(resp, status=status.HTTP_400_BAD_REQUEST)
            return Response(resp, status=status.HTTP_200_OK)
        elif 'achievements' in request.FILES:
            uploaded_file = request.FILES['achievements']
            try:
                # Try to load and parse the JSON data
                json_data = json.load(uploaded_file)
            except json.JSONDecodeError:
                return Response({'error': 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)

            responses = []

            for achievement_data in json_data:
                parsed_level = self.parse_achievement_data(achievement_data)
                if 'error' in parsed_level:
                    responses.append({'error': f'Invalid Achievement JSON for achievement: {achievement_data.get("title")}, error: {parsed_level.error}'})
                else:
                    responses.append(parsed_level)
            return Response(responses, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No JSON file provided in the request'}, status=status.HTTP_400_BAD_REQUEST)

    def parse_achievement_data(self, achievement_data):
        # access the JSON data and process it
        name = achievement_data.get('name')
        description = achievement_data.get('description')
        hint = achievement_data.get('hint')
        class_related = achievement_data.get('class_related')
        condition_type = achievement_data.get('condition_type')

        data_json = {
            'name': name,
            'description': description,
            'hint': hint,
            'class_related': class_related
        }

        match condition_type:
            case 'LEVEL_COMPLETION':
                level_id = achievement_data.get('level_id') or None
                perfection_required = achievement_data.get('perfection_required') or False
                condition_json = {
                    'condition_type': AchievementCondition.AchievementConditionType.LEVEL_COMPLETION,
                    'level': level_id,
                    'perfection_required': perfection_required
                }

            case 'LEVEL_RETRY':
                condition_json = {
                    'condition_type': AchievementCondition.AchievementConditionType.LEVEL_RETRY,
                }

            case 'SCENARIO_COMPLETION':
                scenario_id = achievement_data.get('scenario_id') or None
                perfection_required = achievement_data.get('perfection_required') or False
                condition_json = {
                    'condition_type': AchievementCondition.AchievementConditionType.SCENARIO_COMPLETION,
                    'scenario': scenario_id,
                    'perfection_required': perfection_required
                }

            case 'STAR_COLLECTION':
                stars = achievement_data.get('stars') or None
                condition_json = {
                    'condition_type': AchievementCondition.AchievementConditionType.STAR_COLLECTION,
                    'stars': stars
                }

            case 'LEADERBOARD_POSITION':
                leaderboard_position = achievement_data.get('leaderboard_position') or None
                condition_json = {
                    'condition_type': AchievementCondition.AchievementConditionType.LEADERBOARD_POSITION,
                    'leaderboard_position': leaderboard_position
                }

            case 'ALL_ACHIEVEMENTS':
                condition_json = {
                    'condition_type': AchievementCondition.AchievementConditionType.ALL_ACHIEVEMENTS
                }

            case 'TUTORIAL_COMPLETION':
                condition_json = {
                    'condition_type': AchievementCondition.AchievementConditionType.TUTORIAL_COMPLETION
                }

            case 'COSMETICS_EQUIPPED':
                cosmetics_equipped = achievement_data.get('cosmetics_equipped') or None
                condition_json = {
                    'condition_type': AchievementCondition.AchievementConditionType.COSMETICS_EQUIPPED,
                    'cosmetics_equipped': cosmetics_equipped
                }

            case _:
                return {'error': 'Invalid condition type'}

        # Create and save AchievementCondition
        condition_serializer = AchievementConditionSerializer(data=condition_json)
        condition_serializer.is_valid(raise_exception=True)
        condition = condition_serializer.save()
        data_json['condition'] = condition.id

        # Create and save Achievement
        serializer = AchievementSerializer(data=data_json)
        serializer.is_valid(raise_exception=True)
        achievement = serializer.save()

        if achievement is None:
            return {'error': 'No achievement uploaded'}

        return serializer.data
