from api.models import Progress, ScenarioProgress
from rest_framework import serializers
from .level_serializers import LevelSerializer


class ProgressSerializer(serializers.ModelSerializer):
    level = LevelSerializer()

    class Meta:
        model = Progress
        fields = ['id', 'user', 'scenario', 'level', 'stars', 'time', 'star_details']


class CreateUpdateProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = ['id', 'level', 'time', 'star_details']

    def create(self, validated_data):
        level = validated_data['level']
        time = validated_data['time']
        star_details = validated_data['star_details']
        model = Progress.objects\
                        .filter(user_id=self.context['user_id'])\
                        .filter(scenario_id=self.context['scenario_id'])\
                        .filter(level_id=level)\
                        .first()
        if model and model.completions > 0:
            new_star_details = [star_details[i] or model.star_details[i] for i in range(len(star_details))]
            if sum(new_star_details) > model.stars or time < model.time:
                model.stars = max(sum(new_star_details), model.stars)
                model.star_details = new_star_details
                model.time = min(time, model.time)
            model.completions += 1
            model.save()
        elif model:
            model.stars = sum(star_details)
            model.star_details = star_details
            model.time = time
            model.completions += 1
            model.save()
        else:
            model = Progress.objects.create(
                user_id=self.context['user_id'],
                scenario_id=self.context['scenario_id'],
                level=level,
                stars=sum(star_details),
                time=time,
                star_details=star_details,
                completions=1
            )
        return model


class ScenarioProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = ScenarioProgress
        fields = ['id', 'user', 'scenario']
