from api.models import Achievement, AchievementCondition, AchievementVisual, UserAchievement
from rest_framework import serializers


class AchievementVisualSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchievementVisual
        fields = ['id', 'name', 'visual']


class AchievementSerializer(serializers.ModelSerializer):
    visual = AchievementVisualSerializer()

    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'hint', 'class_related', 'condition', 'visual']


class AchievementConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchievementCondition
        fields = ['condition_type', 'level', 'scenario', 'stars', 'perfection_required', 'leaderboard_position', 'cosmetics_equipped']


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer()

    class Meta:
        model = UserAchievement
        fields = ['user', 'achievement', 'unlocked_at']
