from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from api.models import Achievement, AchievementCondition, UserAchievement
from api.custom_serializers.achievement_serializers import AchievementSerializer
from api.helper import award_achievement, check_full_completion_achievements


class TutorialView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        user.tutorial = request.data.get('tutorial')
        user.save()

        if request.data.get('completed'):
            achievements = Achievement.objects.filter(condition__condition_type=AchievementCondition.AchievementConditionType.TUTORIAL_COMPLETION)
            user_achievements = UserAchievement.objects.filter(user=user, achievement__in=achievements)
            available_achievements = set(achievements) - set([user_achievement.achievement for user_achievement in user_achievements])
            for achievement in available_achievements:
                award_achievement(user, achievement)

            achieved_achievements = list(available_achievements) + check_full_completion_achievements(user)

            achievement_serializer = AchievementSerializer(achieved_achievements, many=True, context={'request': request})
            return Response({'msg': 'Tutorial updated', 'achievements': achievement_serializer.data}, status=200)

        return Response({'msg': 'Tutorial updated'}, status=200)
