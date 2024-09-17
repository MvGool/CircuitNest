from rest_framework import serializers
from rest_polymorphic.serializers import PolymorphicSerializer
from api.models import ExerciseLevel, InformationLevel, Level


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'title', 'description', 'number', 'scenario', 'prerequisites']

    def to_representation(self, obj):
        """
        Because Level is Polymorphic
        """
        if isinstance(obj, InformationLevel):
            representation = InformationLevelSerializer(obj, context=self.context).to_representation(obj)
            representation['level_type'] = 'Information'
            return representation
        elif isinstance(obj, ExerciseLevel):
            representation = ExerciseLevelSerializer(obj, context=self.context).to_representation(obj)
            representation['level_type'] = 'Exercise'
            return representation
        return super(LevelSerializer, self).to_representation(obj)


class AddLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'title', 'description', 'number', 'scenario', 'creator', 'active']  # TODO: Add prerequisites and type


class InformationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformationLevel
        fields = ['id', 'title', 'description', 'number', 'scenario', 'prerequisites', 'content', 'guides']


class AddInformationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformationLevel
        fields = ['id', 'title', 'description', 'number', 'scenario', 'creator', 'active', 'prerequisites', 'content', 'guides']


class ExerciseLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseLevel
        fields = ['id', 'title', 'description', 'number', 'scenario', 'prerequisites', 'start_type', 'end_type',
                  'challenge', 'gates', 'inputs', 'outputs', 'truth_table', 'boolean_function', 'graphical', 'code', 'time_goal']


class AddExerciseLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseLevel
        fields = ['id', 'title', 'description', 'number', 'scenario', 'creator', 'active', 'prerequisites', 'start_type', 'end_type',
                  'challenge', 'gates', 'inputs', 'outputs', 'truth_table', 'boolean_function', 'graphical', 'code', 'time_goal']


class LevelPolymorphicSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        Level: LevelSerializer,
        InformationLevel: InformationLevelSerializer,
        ExerciseLevel: ExerciseLevelSerializer
    }
