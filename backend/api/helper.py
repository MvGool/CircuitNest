import numpy as np
import sympy
import itertools
import pydot
import subprocess
import uuid
import os
from sympy.parsing.sympy_parser import T, standard_transformations
from django.db.models import Sum, Count


from api.models import Achievement, AchievementCondition, AvatarCosmetic, ExerciseLevel, Participant, Progress, User, Level, UserAchievement
from api.custom_serializers.achievement_serializers import AchievementSerializer
from api.custom_serializers.participant_serializers import AddParticipantSerializer, UpdateParticipantSerializer
from api.custom_serializers.progress_serializers import CreateUpdateProgressSerializer, ProgressSerializer, ScenarioProgressSerializer
from api.utils.custom_node import BooleanTree


def boolean_function_to_truth_table(expressions, inputs):
    input_concat = " ".join(inputs)
    symbols = sympy.symbols(input_concat)
    results = []

    # Generate and evaluate truth table
    input_combinations = itertools.product([False, True], repeat=len(inputs))
    for values in input_combinations:
        values_dict = {symbol: value for symbol, value in zip(symbols, values)}
        result = np.array(values, dtype=bool)
        for expression in expressions:
            try:
                parsed_expression = sympy.sympify(expression, convert_xor=False)
                result = np.append(result, np.array(parsed_expression.subs(values_dict), dtype=bool))
            except Exception as e:
                print(e)
                # error on parsing boolean function -> fundamental error on boolean function
                return []
        results.append(result.tolist())

    return results


def compare_truth_tables(tt1, tt2, input_count):
    # tt1 is truth table from user
    # tt2 is truth table from database ( teacher )
    num_tt1 = np.array(tt1)
    num_tt2 = np.array(tt2)

    # exactly like database truth table
    if np.array_equal(num_tt1, num_tt2):
        return {
            'status': 'correct'
        }

    # check for correct input combination
    for idx, tt_row in enumerate(num_tt1):
        row_input = tt_row[:input_count]

        for idy, tt_row_comp in enumerate(num_tt1[idx + 1:, :]):
            row_input_comp = tt_row_comp[:input_count]
            if np.array_equal(row_input_comp, row_input):
                return {
                    'status': 'incorrect',
                    'incorrect_line': idx + 1 + idy,
                    'error_text': 'This combination already exists'
                }

    # comparing line by line truth table ( assumption -> input is not repeated )
    real_input = num_tt2[:, :input_count]
    real_output = num_tt2[:, input_count:]

    for idy, tt_row in enumerate(num_tt1):
        row_input = tt_row[:input_count]
        row_output = tt_row[input_count:]

        for idx, original_tt_row in enumerate(real_input):
            if np.array_equal(row_input, original_tt_row):
                # check for equality of output
                if np.array_equal(row_output, real_output[idx]):
                    real_input = np.delete(real_input, idx, 0)
                    real_output = np.delete(real_output, idx, 0)
                    break
                else:
                    return {
                        'status': 'incorrect',
                        'incorrect_line': idy,
                        'error_text': 'Wrong output in the highlighted line'
                    }

    if len(real_input) != 0:
        return {
            'status': 'incorrect'
        }
    else:
        return {
            'status': 'correct'
        }


def code_checker(code_lines, missing_lines, original_code):
    # code lines is the answer from user
    # missing lines is the index indicated by teacher
    # original code is coming from database

    original_code_seperated = original_code.split('\n')

    for idx, line in enumerate(code_lines):
        if original_code_seperated[missing_lines[idx] - 1] != line:
            error_text = 'Incorrect line in this place'
            if line == '':
                error_text = 'Fill the empty line'

            return {
                'status': 'incorrect',
                'incorrect_code': line,
                'incorrect_code_index': idx,
                'error_text': error_text
            }

    return {
        'status': 'correct'
    }


def modify_dot_file_removing_extras(dot_content):
    # this function is for removing renamed or assigned wires from dot file (aka diamond shapes in dot file)
    # in this function go over all the edges to reconnect non-diamond nodes together
    # at the end try to make the ports in the right order
    # \n remove from string because we are parsing dot file to string which cause problem at image creation level

    graph = pydot.graph_from_dot_data(dot_content)[0]

    # Find and remove diamond-shaped nodes
    diamond_nodes = []
    for node in graph.get_nodes():
        if node.get_shape() == "diamond":
            diamond_nodes.append(node)
            graph.del_node(node.get_name())

    # Reconnect edges
    for edge in graph.get_edges():
        src_edge, dest_edge = edge.get_source(), edge.get_destination()
        src_node_name, src_port = src_edge.split(':', 1)
        dest_node_name, dest_port = dest_edge.split(':', 1)

        # Find the corresponding nodes
        src_node = graph.get_node(src_node_name)
        dest_node = graph.get_node(dest_node_name)

        # if a node is connected to a diamond shaped node and that diamond shape has multiple output we need to
        # iterate over them

        dest_node_names = []
        dest_ports = []

        if len(dest_node) == 0:
            # find the right edge to connect
            for right_edge in graph.get_edges():
                if (len(right_edge.get_source().split(':')) > 1 and
                        right_edge.get_source().split(':', 1)[0] == dest_node_name):
                    if len(right_edge.get_destination().split(':')) == 1:
                        dest_node_name_temp = right_edge.get_destination()
                        dest_port = ''
                    else:
                        dest_node_name_temp, dest_port = right_edge.get_destination().split(':', 1)

                    # add the find node to ports and names and node array
                    dest_ports.append(dest_port)
                    dest_node_names.append(dest_node_name_temp)
                    dest_node.append(graph.get_node(dest_node_name_temp)[0])

        else:
            # if we found the node in the array it means that it is not a diamond shape, and we can proceed with normal
            # conversion
            dest_ports.append(dest_port)
            dest_node_names.append(dest_node_name)

        if len(src_node) == 0:
            # find the right edge to connect
            for right_edge in graph.get_edges():
                if right_edge.get_destination().split(':', 1)[0] == src_node_name:
                    src_node_name, src_port = right_edge.get_source().split(':', 1)
                    src_node = graph.get_node(src_node_name)
                    break

        if len(src_node) == 0 or len(dest_node) == 0:
            # no src and des found, so we have to skip next parts
            continue

        src_port_split = src_port.split(':')
        if len(src_port_split) >= 1:
            src_port = src_port_split[0]
            if src_port == 'w' or src_port == 'e':
                src_port = ''

        # iterate over ports of dest to make them in a good shape
        for idx, dest_port_temp in enumerate(dest_ports):
            dest_port_split = dest_port_temp.split(':')
            if len(dest_port_split) >= 1:
                dest_ports[idx] = dest_port_split[0]
                if dest_ports[idx] == 'w' or dest_ports[idx] == 'e':
                    dest_ports[idx] = ''

        # remove current edge from graph
        graph.del_edge(edge.get_source(), edge.get_destination())

        # add replaced destinations that found
        for idx, temp in enumerate(dest_node):
            # Connect the nodes with the ports
            graph.add_edge(pydot.Edge(src_node[0], dest_node[idx], src_port=src_port, dest_port=dest_ports[idx]))

    # remove extra edges
    for node in diamond_nodes:
        # Find edges connected to diamond nodes and mark them for removal
        for edge in graph.get_edges():
            src_edge, dest_edge = edge.get_source(), edge.get_destination()
            if len(src_edge.split(':')) == 1 and len(dest_edge.split(':')) == 1:
                continue
            else:
                graph.del_edge(edge.get_source(), edge.get_destination())

    # Convert the modified graph back to DOT format
    modified_dot_file = graph.to_string()

    # replace \n in dot file with empty line
    modified_dot_file = modified_dot_file.replace('"\\n";\n', '')

    return modified_dot_file


def compare_boolean_functions(expressions, answers):
    # normalize the string -> remove all the \n from the string and convert it to array
    expressions = expressions.split('\n')

    for idx, expression in enumerate(expressions):
        expressions[idx] = expression.split('=')[1]

    # answer = answers.replace(' ', '')

    if len(expressions) != len(answers):
        return {
            'error': 'answers are not complete'
        }

    for idx, answer in enumerate(answers):
        expression = expressions[idx]
        # Parse and normalize the expressions using sympy
        try:
            user_parsed = sympy.parse_expr(answer, evaluate=False)
            correct_parsed = sympy.parse_expr(expression, evaluate=False)

            # Convert the normalized expressions back to strings for character comparison
            user_normalized = str(user_parsed)
            correct_normalized = str(correct_parsed)

            # TODO: The problem in hear is that parse expr is simplifying some of the expression This should not be done
            # for now we put the original string back to answer ro correct part if the library simplified it
            # the problem is somehow fixed by exploring right and left or left and right
            if len(user_normalized) != len(answer):
                user_normalized = answer
            if len(correct_normalized) != len(expression):
                correct_normalized = expression

            user_normalized = user_normalized.replace(" ", "")
            correct_normalized = correct_normalized.replace(" ", "")

            teacher_tree = BooleanTree(correct_normalized)
            student_tree = BooleanTree(user_normalized)

            # teacher_tree.print_expression_tree_tree_format()
            # student_tree.print_expression_tree_tree_format()

            error = BooleanTree.compare_trees(teacher_tree.tree, student_tree.tree)

            if error is not None:
                return {
                    'status': 'incorrect',
                    'incorrect_line': idx,
                    'incorrect_index': error,
                    'error_text': 'Wrong character in the red position'
                }

        except Exception:
            user_normalized = answer.replace(" ", "").strip()
            correct_normalized = expression.replace(" ", "").strip()

            error = 'Try to reformat the boolean function in the correct format'
            if len(user_normalized) != len(correct_normalized):
                # means that the user is not input the fully len of the boolean function
                error = 'Try to fill the empty parts and make fully filled boolean function'

            # cannot parse the boolean function, which means that there is a fundamental error in boolean function
            return {
                'status': 'incorrect',
                'incorrect_line': -1,
                'incorrect_index': -1,
                'error_text': error
            }

    return {
        'status': 'correct'
    }


def change_progress_level(level: Level, user: User, stars, total_time):
    serializer = CreateUpdateProgressSerializer(data={
        'level': level.id,
        'star_details': stars,
        'time': total_time,
    }, context={
        'user_id': user.id,
        'scenario_id': level.scenario_id
    })

    if serializer.is_valid():
        serializer.save()
        return serializer.data

    return serializer.errors


def increase_progress_submission(level: Level, user: User):
    progress = Progress.objects.filter(user_id=user.id, level_id=level.id).first()
    if progress is not None:
        progress.submissions += 1
        progress.save()
        progress
    else:
        # If the progress does not exist, create a new one
        progress = Progress.objects.create(
            user=user,
            level=level,
            scenario=level.scenario,
            submissions=1
        )

    serializer = ProgressSerializer(progress)

    return serializer.data


def change_progress_scenario(scenario, user):
    # check if the user has completed all levels in the scenario
    needed_completions = ExerciseLevel.objects.filter(scenario_id=scenario)
    completed_levels = Progress.objects.filter(user_id=user.id, level__in=needed_completions)

    if len(completed_levels) == len(needed_completions):
        # if all levels are completed, add the scenario to the user's completed scenarios
        serializer = ScenarioProgressSerializer(data={
            'user': user.id,
            'scenario': scenario,
        })

        if serializer.is_valid():
            serializer.save()
            return serializer.data

        return serializer.errors

    return None


def award_achievement(user, achievement):
    # award the user with the achievement
    UserAchievement.objects.create(user=user, achievement=achievement)
    if achievement.reward is not None:
        # grant the user the cosmetic reward if it isn't already owned
        owned_cosmetic = AvatarCosmetic.objects.filter(avatar=user.avatar, cosmetic=achievement.reward).first()
        if owned_cosmetic is None:
            AvatarCosmetic.objects.create(avatar=user.avatar, cosmetic=achievement.reward, unlocked=True)

    return achievement


def check_achievements(user, level, stars, total_time):
    # check if the user has achievements
    # if the user has achievements then return the achievements
    all_achievements = Achievement.objects.filter(class_related=user.class_related)
    user_achievements = UserAchievement.objects.filter(user_id=user.id)
    # get all achievements that the user has not achieved yet excluding the achievements that require all achievements
    achievable_achievements = all_achievements\
        .exclude(id__in=[ach.achievement.id for ach in user_achievements])

    achieved_achievements = []
    for achievement in achievable_achievements:
        if check_condition(achievement, user, level, stars):
            award_achievement(user, achievement)
            achieved_achievements.append(achievement)

    achieved_achievements = achieved_achievements + check_full_completion_achievements(user)

    # return the achieved achievements
    if len(achieved_achievements) == 0:
        return None
    else:
        serializer = AchievementSerializer(achieved_achievements, many=True)
        return serializer.data


def check_condition(achievement, user, level, stars):
    # get condition parameters
    cond_type = achievement.condition.condition_type

    # see which condition type is needed
    if cond_type == AchievementCondition.AchievementConditionType.LEVEL_COMPLETION:
        # check if the user has completed the correct level
        correct_completion = level.id == achievement.condition.level_id or achievement.condition.level is None
        perfect = stars == [True, True, True] or not achievement.condition.perfection_required
        return correct_completion and perfect
    elif cond_type == AchievementCondition.AchievementConditionType.LEVEL_RETRY:
        # check if the user has completed the correct level
        progress = Progress.objects.filter(user_id=user.id, level_id=level.id).first()
        return progress.completions > 1
    elif cond_type == AchievementCondition.AchievementConditionType.SCENARIO_COMPLETION:
        # check if the user has completed all levels in the scenario
        needed_completions = ExerciseLevel.objects.filter(scenario_id=achievement.condition.scenario_id)
        completed_levels = Progress.objects.filter(user_id=user.id, level__in=needed_completions)
        if achievement.condition.perfection_required:
            return len(completed_levels) == len(needed_completions) and all([progress.star_details == [True, True, True] for progress in completed_levels])
        return len(completed_levels) == len(needed_completions)
    elif cond_type == AchievementCondition.AchievementConditionType.STAR_COLLECTION:
        # check if the user has collected the correct number of stars
        collected_stars = sum(Progress.objects.filter(user_id=user.id).values_list('stars', flat=True))
        return collected_stars >= achievement.condition.stars
    elif cond_type == AchievementCondition.AchievementConditionType.LEADERBOARD_POSITION:
        # check if the user has the correct leaderboard position in either leaderboard
        leaderboard = Progress.objects\
            .filter(user__class_related=user.class_related)\
            .filter(scenario__class_related=user.class_related)\
            .values('user')\
            .annotate(total_stars=Sum('stars'))\
            .annotate(total_levels=Count('time'))
        star_leaderboard = leaderboard.order_by('-total_stars', '-total_levels')
        level_leaderboard = leaderboard.order_by('-total_levels', '-total_stars')
        return list(star_leaderboard.values_list('user_id', flat=True)).index(user.id) + 1 <= achievement.condition.leaderboard_position or \
            list(level_leaderboard.values_list('user_id', flat=True)).index(user.id) + 1 <= achievement.condition.leaderboard_position
    else:
        return False


def check_cosmetic_achievements(user_id):
    user = User.objects.get(id=user_id)

    # check if the user has achieved any cosmetic achievements
    # if the user has achievements then return the achievements
    all_achievements = Achievement.objects.filter(class_related=user.class_related)
    user_achievements = UserAchievement.objects.filter(user_id=user.id)
    # get all achievements that the user has not achieved yet excluding the achievements that require all achievements
    achievable_cosmetic_achievements = all_achievements\
        .exclude(id__in=[ach.achievement.id for ach in user_achievements])\
        .filter(condition__condition_type=AchievementCondition.AchievementConditionType.COSMETICS_EQUIPPED)

    cosmetics_equiped = AvatarCosmetic.objects.filter(avatar=user.avatar, equipped=True).count()
    achieved_achievements = []
    for achievement in achievable_cosmetic_achievements:
        if cosmetics_equiped >= achievement.condition.cosmetics_equipped:
            award_achievement(user, achievement)
            achieved_achievements.append(achievement)

    achieved_achievements = achieved_achievements + check_full_completion_achievements(user)

    return achieved_achievements


def check_full_completion_achievements(user):
    # check if the user already has the achievement for all achievements
    all_full_completion_achievements = Achievement.objects.filter(condition__condition_type=AchievementCondition.AchievementConditionType.ALL_ACHIEVEMENTS, class_related=user.class_related)
    if len(UserAchievement.objects
           .filter(user_id=user.id)
           .filter(achievement__class_related=user.class_related)
           .filter(achievement__condition__condition_type=AchievementCondition.AchievementConditionType.ALL_ACHIEVEMENTS))\
            >= len(all_full_completion_achievements):
        return []

    # check achievements still left to be achieved
    all_achievements = Achievement.objects.filter(class_related=user.class_related)
    user_achievements = UserAchievement.objects.filter(user_id=user.id)
    achievable_achievements = all_achievements\
        .exclude(id__in=[ach.achievement.id for ach in user_achievements])\
        .exclude(condition__condition_type=AchievementCondition.AchievementConditionType.ALL_ACHIEVEMENTS)

    achieved_achievements = []
    # check if the user has achieved all achievements
    if len(achievable_achievements) == 0:
        # user has achieved all achievements
        full_completion_achievements = all_achievements.filter(condition__condition_type=AchievementCondition.AchievementConditionType.ALL_ACHIEVEMENTS)
        for achievement in full_completion_achievements:
            award_achievement(user, achievement)
            achieved_achievements.append(achievement)

    return list(achieved_achievements)


def truth_table_to_boolean_function(truth_table, inputs, outputs):
    expressions = []
    truth_table = truth_table
    input_concat = " ".join(inputs)
    symbols = sympy.symbols(input_concat)
    input_len = len(inputs)
    for idx, output in enumerate(outputs):
        # compute the current output and inputs to boolean function
        minterms = []

        for row in truth_table:
            if row[input_len + idx]:
                minterms.append(row[:input_len])

        expression = sympy.POSform(symbols, minterms)
        expressions.append(f'{output} = {expression}')

    return expressions


def code_to_dot(code):
    # generate image and save it in directory and pass the unique name and the dot file generated

    # Create a temporary Verilog file
    with open('temp.v', 'w') as f:
        f.write(code)

    try:
        # subprocess.run(['yosys', '-p',
        #                 f'read_verilog temp.v; synth -top top_module; proc; opt; clean -purge; show -notitle -colors 2 -format dot -prefix temp'])

        subprocess.run(['yosys', '-p',
                        'read_verilog temp.v; synth -noabc -flatten; clean -purge; show -notitle -colors 2 -format dot -prefix temp'])

        # Process the DOT file to identify and modify gates
        with open('temp.dot', 'r') as dot_file:
            dot_content = dot_file.read()

        # make changes on dot file
        dot_content = modify_dot_file_removing_extras(dot_content)

        # Write the modified DOT content back to the file
        with open('temp.dot', 'w') as dot_file:
            dot_file.write(dot_content)

        subprocess.run(['dot', '-Tpng', 'temp.dot', '-o', 'temp.png'])

        # Generate a unique filename for the saved image
        unique_filename = f'circuit_{uuid.uuid4().hex}.png'

        # Move the generated image to the media directory with the unique filename
        os.rename('temp.png', os.path.join('media/circuit_images', unique_filename))

        # Clean up temporary files
        os.remove('temp.v')
        os.remove('temp.dot')

        return unique_filename, dot_content
    except Exception as e:
        raise ValueError('Code couldn\'t be compiled to graphical!', e)


def refine_code(code):
    # remove extra \n in the code
    lines = code.split('\n')
    cleaned_text = '\n'.join(line for line in lines if line.strip())

    return cleaned_text


def generate_code_lines_hidden(code):
    # generate all lines be hidden
    lines = code.split('\n')
    code_lines = list(range(len(lines) + 1))
    code_lines.remove(0)
    return code_lines


# ------------------ UNUSED FUNCTIONS ------------------
def add_participant_level(level: Level, user: User, input_type, output_type, completed, time):
    participant = Participant.objects.filter(user__id=user.id, scenario__id=level.scenario_id,
                                             level__id=level.id).first()

    if participant:
        # user add participant serializer to modify participant into database
        serializer = UpdateParticipantSerializer(participant, data={
            'input_types': [input_type],
            'output_types': [output_type],
            'total_time': time
        }, context={
            'completed': completed
        })
    else:
        # user add participant serializer to add participant into database
        serializer = AddParticipantSerializer(data={
            'level': level.id,
            'input_types': [input_type],
            'output_types': [output_type],
            'total_time': time,
            'scenario': level.scenario_id
        }, context={
            'related_class': user.class_related_id,
            'user_id': user.id,
            'completed': completed
        })

    if serializer.is_valid():
        serializer.save()
        return serializer.data

    return serializer.errors
