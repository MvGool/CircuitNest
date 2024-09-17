from typing import List
import pydot
import re


class TreeNode:

    def __init__(self, value, name, is_operator):
        self.value = value
        self.children = []
        self.ingoing = []
        self.name = name
        self.operator = is_operator


class GraphTree:
    tree: List[TreeNode]

    def __init__(self, dot, in_out_array):
        self.nodes = self.get_node_from_dot(dot, in_out_array)

    def get_node_from_dot(self, dot_string, in_out_array):
        graphs = pydot.graph_from_dot_data(dot_string)
        graph = graphs[0]

        vertices = []
        for node in graph.get_nodes():
            label = self.convert_string_label_to_normal_string(node.get_attributes().get('label'))
            label = re.sub('"', '', label)
            vertices.append(TreeNode(label, node.get_name(), not (node.get_name() in in_out_array)))

        for edge in graph.get_edges():
            source_node = next(x for x in vertices if x.name == edge.get_source())
            destination_node = next(x for x in vertices if x.name == edge.get_destination())
            source_node.children.append(destination_node)
            destination_node.ingoing.append(source_node)

        return vertices

    def convert_string_label_to_normal_string(self, input_string):
        # Define a regular expression pattern to match the keyword of NOT, AND, ...
        pattern = r'\$[^$]*_([^_]+)_'
        # Use re.findall to find all matches of the pattern in the input string
        matches = re.findall(pattern, input_string)

        # The "matches" list will contain the extracted keywords
        if len(matches) >= 1:
            return matches[0].lower()
        else:
            return input_string.lower()

    @staticmethod
    def compare_graphs(correct_tree: List[TreeNode], user_tree: List[TreeNode]):
        #  compare each node one by one
        errors = []

        for node_answer in correct_tree:
            node_user = next((x for x in user_tree if x.value == node_answer.value), None)

            if node_user is None:
                # user node is not found means that the user did not use that gate
                errors.append(f'missing {node_answer.value}')
                continue

            node_answer_ingoing_count = len(node_answer.ingoing)

            total_outgoing_error = 0
            # go over outgoing the edges
            for idx, child_user in enumerate(node_user.children):
                found = False
                for idy, child_correct in enumerate(node_answer.children):
                    if child_user.value == child_correct.value:
                        node_answer.children.pop(idy)
                        found = True
                        break

                if not found:
                    total_outgoing_error += 1
                    errors.append(f'wrong {node_user.name} -> {child_user.name}')

            total_ingoing_error = 0
            # go over ingoing nodes
            for idx, ingoing_user in enumerate(node_user.ingoing):
                found = False
                for idy, ingoing_correct in enumerate(node_answer.ingoing):
                    if ingoing_user.value == ingoing_correct.value:
                        node_answer.ingoing.pop(idy)
                        found = True
                        break

                if not found:
                    total_ingoing_error += 1

            if node_user.operator:
                if node_answer_ingoing_count != len(node_user.ingoing) or node_user.children == 0:
                    errors.append(f'incomplete {node_user.name}')
                elif total_ingoing_error == len(node_user.ingoing) and total_outgoing_error == len(node_user.children):
                    errors.append(f'misplaced {node_user.name}')

        return errors

    def print_graph_tree_format(self, children: List[TreeNode] = None, indent=0):
        if not children:
            children = self.nodes

        for child in children:
            print(" " * indent + child.value)
            if len(child.children) != 0:
                self.print_graph_tree_format(child.children, indent + 4)
