from ast import literal_eval
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import ExerciseLevel, Level, Progress
from api.helper import change_progress_scenario, check_achievements, compare_truth_tables, boolean_function_to_truth_table, compare_boolean_functions, \
    code_checker, change_progress_level, add_participant_level, increase_progress_submission
from api.utils.graphical_helper import GraphTree
from api.custom_serializers.progress_serializers import ProgressSerializer


class CompleteInformationLevel(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        level = Level.objects.filter(pk=request.data.get('levelId')).first()
        if not level:
            return Response({'error': 'Level not found'}, status=status.HTTP_400_BAD_REQUEST)

        if Progress.objects.filter(user=request.user, level=level).exists():
            return Response({'msg': 'Level already completed'}, status=status.HTTP_200_OK)

        progress = Progress.objects.create(
            user=request.user,
            level=level,
            scenario=level.scenario
        )

        serializer = ProgressSerializer(progress)

        data = {
            'progress': serializer.data,
        }

        return Response(data, status=status.HTTP_200_OK)


class SubmitAnswerLevel(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # retrieve level object
        level = Level.objects.filter(pk=request.data.get('levelId')).first()
        data = {}

        endType = request.data.get('endType')
        total_time = request.data.get('total_time')
        mistakes = request.data.get('mistakes')

        error = None
        if type(request.data.get('answer')) == dict:
            error = request.data.get('answer').get('error')

        if not error:
            if endType == 'truth_table':

                truth_table = request.data.get('answer')
                # convert to array if passed string array
                if isinstance(truth_table, str):
                    truth_table = literal_eval(truth_table)
                # add status and if wrong truth table given the row index of error
                compared_status = compare_truth_tables(truth_table, level.truth_table, len(level.inputs))
                data = compared_status

            elif endType == 'boolean_function':
                # end type is boolean function
                # first try to create the truth table of boolean function
                # if wrong we should get help from weighting algorithm
                expressions = request.data.get('answer')
                if isinstance(expressions, str):
                    expressions = literal_eval(expressions)
                truth_table = boolean_function_to_truth_table(expressions, level.inputs)

                # check for correctness of generated truth table out of boolean function
                compared_status = compare_truth_tables(truth_table, level.truth_table, len(level.inputs))
                data = compared_status
                # if compared_status.get('status') == 'correct':
                #     data = {
                #         'status': 'correct'
                #     }
                # else:
                #     # send feed back here
                #     # analyze the problem of the boolean function
                #     data = compare_boolean_functions(level.boolean_function, expressions)

            elif endType == 'graphical':
                # check if the truth table generated is correct or not
                answer = request.data.get('answer')
                truth_table = answer.get('truth_table')
                # convert to array if passed string array
                if isinstance(truth_table, str):
                    truth_table = literal_eval(truth_table)
                compared_status = compare_truth_tables(truth_table, level.truth_table, len(level.inputs))

                if compared_status.get('status') == 'correct':
                    data = {
                        'status': 'correct'
                    }
                else:
                    # send feedback here
                    # analyze the problem in the graph

                    graphical_dot = answer.get('graphical')
                    graphical_dot = graphical_dot.replace('\n', '')

                    answer_dot = level.graph_dot
                    answer_dot = answer_dot.replace('\n', '')

                    in_out_array = level.inputs + level.outputs

                    # create two graph trees out of dot files
                    user_graph = GraphTree(graphical_dot, in_out_array)
                    correct_graph = GraphTree(answer_dot, in_out_array)

                    # get comparing errors
                    errors = GraphTree.compare_graphs(correct_graph.nodes, user_graph.nodes)
                    data = {
                        'status': 'incorrect',
                        'errors': errors
                    }

            elif endType == 'code':

                # check the original code with the missing lines with the answer user send using code lines
                # the indexing of code lines is base on the code_lines in the database
                # the first missing line is index 0 in code_lines from user and it can be line 5 for example in code -> level.code_lines[5]
                code_lines = request.data.get('answer')
                # convert to array if passed string array
                if isinstance(code_lines, str):
                    code_lines = literal_eval(code_lines)
                compared_code = code_checker(code_lines, level.code_lines, level.code)
                data = compared_code

        # give feedback and answer base on the answer
        # save progress and participant

        completed = False
        if data.get('status') == 'correct':
            completed = True

        # calculate score
        stars = [False, False, False]

        if completed:
            stars[0] = True
            if mistakes == 0:
                stars[1] = True
            if total_time <= level.time_goal:
                stars[2] = True

        progress = change_progress_level(level, request.user, stars, total_time) if completed else None
        progress = increase_progress_submission(level, request.user)

        scenario_progress = change_progress_scenario(level.scenario_id, request.user) if completed else None

        # participant = add_participant_level(level, request.user, startType, endType, completed, total_time)

        # check achievements
        achievements = check_achievements(request.user, level, stars, total_time) if completed else None

        if completed:
            data['stars'] = stars
            data['total_time'] = total_time
        if progress:
            data['progress'] = progress
        if scenario_progress:
            data['scenario_progress'] = scenario_progress
        if achievements:
            data['achievements'] = achievements

        if error:
            data['status'] = 'incorrect'
            data['error'] = error

        return Response(data, status=status.HTTP_200_OK)
