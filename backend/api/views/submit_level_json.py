from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
import json
from django.db.models import Q

from api.custom_serializers.level_serializers import AddExerciseLevelSerializer, AddInformationLevelSerializer, AddLevelSerializer, LevelSerializer
from api.helper import truth_table_to_boolean_function, code_to_dot, refine_code, generate_code_lines_hidden
from api.models import Level


class SubmitLevelJSON(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        # Check if the request contains a file
        if 'level' in request.FILES:
            uploaded_file = request.FILES['level']
            try:
                # Try to load and parse the JSON data
                json_data = json.load(uploaded_file)
            except json.JSONDecodeError:
                return Response({'error': 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)

            resp = self.parse_level_data(json_data, request.user)
            return Response(resp, status=status.HTTP_200_OK)
        elif 'levels' in request.FILES:
            uploaded_file = request.FILES['levels']
            try:
                # Try to load and parse the JSON data
                json_data = json.load(uploaded_file)
            except json.JSONDecodeError:
                return Response({'error': 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)

            responses = []

            for level_data in json_data:
                parsed_level = self.parse_level_data(level_data, request.user)
                if parsed_level is None:
                    responses.append({'error': f'Invalid Level JSON for level: {level_data.get("title")}'})
                else:
                    responses.append(parsed_level)
            return Response(responses, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No JSON file provided in the request'}, status=status.HTTP_400_BAD_REQUEST)

    def parse_level_data(self, level_data, user):
        # access the JSON data and process it
        title = level_data.get('title')
        description = level_data.get('description')
        number = level_data.get('number')
        scenario_id = level_data.get('scenario_id')
        active = level_data.get('active') or True

        # get prerequisite ids from names
        prerequisites = level_data.get('prerequisites')

        if len(prerequisites) > 0:
            prerequisites = [prerequisite.id for prerequisite in Level.objects.filter(title__in=prerequisites).filter(scenario=scenario_id)]

        level_type = level_data.get('level_type')

        if level_type == 'Information':
            content = level_data.get('content')
            guides = level_data.get('guides')

            data_json = {
                'title': title,
                'description': description,
                'number': number,
                'scenario': scenario_id,
                'creator': user.id,
                'active': active,
                'prerequisites': prerequisites,
                'content': content,
                'guides': guides
            }

            # Create and save serializer
            serializer = AddInformationLevelSerializer(data=data_json)
            serializer.is_valid(raise_exception=True)
            level = serializer.save()

        elif level_type == 'Exercise':
            start_type = level_data.get('start_type')
            end_type = level_data.get('end_type')
            challenge = level_data.get('challenge')
            gates = level_data.get('gates')
            inputs = level_data.get('inputs')
            outputs = level_data.get('outputs')
            truth_table = level_data.get('truth_table')
            boolean_function = level_data.get('boolean_function')
            graphical = level_data.get('graphical')
            code = level_data.get('code')
            time_goal = level_data.get('time_goal')

            if not boolean_function or boolean_function == '':
                # generate boolean function
                expressions = truth_table_to_boolean_function(truth_table, inputs, outputs)
                boolean_function = '\n'.join(expressions)

            data_json = {
                'title': title,
                'description': description,
                'number': number,
                'scenario': scenario_id,
                'creator': user.id,
                'active': active,
                'prerequisites': prerequisites,
                'start_type': start_type,
                'end_type': end_type,
                'challenge': challenge,
                'gates': gates,
                'inputs': inputs,
                'outputs': outputs,
                'truth_table': truth_table,
                'boolean_function': boolean_function,
                'graphical': graphical,
                'code': code,
                'time_goal': time_goal
            }

            # Create and save serializer
            serializer = AddExerciseLevelSerializer(data=data_json)
            serializer.is_valid(raise_exception=True)
            level = serializer.save()

        if level is None:
            return None

        serializer = LevelSerializer(level)
        return serializer.data
