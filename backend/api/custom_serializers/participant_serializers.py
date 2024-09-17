from api.models import Participant, Scenario, Classroom, User, Level
from rest_framework import serializers


class ParticipantSerializer(serializers.ModelSerializer):
    # user = SimpleUserSerializer()
    class Meta:
        model = Participant
        fields = '__all__'

    def update(self, instance, validated_data):
        instance.count += 1
        return super().update(instance, validated_data)


def calculate_score(time, error_count, is_new_answer, average_time, prev_output=None, new_output=None):
    if not is_new_answer:
        if prev_output and new_output and len(prev_output) == len(new_output):
            return 0
        return 5

    base_score = 100
    score = 0
    error_penalty = 5

    if average_time and average_time != 0:
        if time <= average_time / 4:
            score = 100
        elif time <= average_time / 2:
            score = 85
        elif time <= average_time * 3 / 4:
            score = 70
        else:
            score = 65
    else:
        score = base_score

    score -= error_penalty * error_count

    if score < 0:
        score = 0

    return score


class AddParticipantSerializer(serializers.ModelSerializer):
    count = serializers.IntegerField(read_only=True)
    error_count = serializers.IntegerField(read_only=True)
    final_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = Participant
        fields = ['id', 'scenario', 'level', 'total_time', 'input_types', 'output_types', 'count', 'error_count',
                  'final_score']

    def create(self, validated_data):
        related_class = self.context['related_class']
        user_id = self.context['user_id']
        total_time = validated_data.get('total_time')
        scenario_id = validated_data.get('scenario').id
        level_id = validated_data.get('level').id
        completed = self.context['completed']

        if related_class:
            classroom = Classroom.objects.filter(id=related_class).first()
            if not classroom:
                raise serializers.ValidationError('Classroom Not Found')

            classroom_scenarios = Scenario.objects.filter(class_related_id=classroom.id)
            user_scenarios = User.objects.filter(class_related_id=classroom.id)

            if not classroom_scenarios.filter(id=scenario_id).exists():
                raise serializers.ValidationError('Scenario Not Found')

            if not user_scenarios.filter(id=user_id).exists():
                raise serializers.ValidationError('Access Denied To This Classroom')

        scenario = Scenario.objects.filter(id=scenario_id).first()
        level = Level.objects.filter(pk=level_id).first()
        if not scenario.level_set.filter(pk=level_id).exists():
            raise serializers.ValidationError('Selected Level is not related to chosen Scenario')

        existence = Participant.objects.all().filter(user__id=user_id) \
            .filter(scenario__id=scenario_id) \
            .filter(level__id=level_id).exists()
        if existence:
            raise serializers.ValidationError('Record with these information is already exists')

        if not completed:
            validated_data['input_types'] = []
            validated_data['output_types'] = []
            final_score = 0
            validated_data['error_count'] = 1
        else:
            final_score = calculate_score(time=total_time, error_count=0, is_new_answer=True,
                                          average_time=level.average_time)

        return Participant.objects.create(count=1, user_id=user_id, class_related_id=related_class,
                                          final_score=final_score, **validated_data)


class UpdateParticipantSerializer(serializers.ModelSerializer):
    count = serializers.IntegerField(read_only=True)
    error_count = serializers.IntegerField(read_only=True)
    final_score = serializers.IntegerField(read_only=True)
    score = serializers.IntegerField(default=0, read_only=True)

    class Meta:
        model = Participant
        fields = ['total_time', 'input_types', 'output_types', 'count', 'error_count', 'final_score', 'score']

    def update(self, instance, validated_data):
        input_types = instance.input_types
        output_types = instance.output_types
        completed = self.context['completed']
        time = validated_data.pop('total_time', None)

        count = instance.count + 1
        total_time = instance.total_time + time

        validated_data['total_time'] = total_time
        validated_data['count'] = count

        is_new_completed = False
        if len(instance.input_types) == 0 and len(instance.output_types) == 0:
            is_new_completed = True

        if not completed:
            # increase error count
            validated_data['error_count'] = instance.error_count + 1

        if completed:
            input_types += validated_data.pop('input_types', None)
            input_types = list(set(input_types))
            validated_data['input_types'] = input_types

            output_types_new = validated_data.pop('output_types', None)
            output_types_new += output_types
            output_types_new = list(set(output_types_new))
            validated_data['output_types'] = output_types_new

            final_score = calculate_score(time=time, error_count=instance.error_count,
                                          average_time=instance.level.average_time,
                                          is_new_answer=is_new_completed,
                                          prev_output=output_types,
                                          new_output=output_types_new)

            if final_score < 0:
                final_score = 0

            instance.score = final_score
            instance.final_score += final_score

        return super().update(instance, validated_data)
