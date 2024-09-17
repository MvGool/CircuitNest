class BinaryTreeNode:
    def __init__(self, value, index, is_operator):
        self.value = value
        self.index = index
        self.operator = is_operator
        self.left = None
        self.right = None


class BooleanTree:
    tree: BinaryTreeNode

    def __init__(self, expression):
        self.tree = self.get_node_from_expression(expression)

    # make tree out of expression string and return the parent node
    def get_node_from_expression(self, expression, index=0):
        expression = expression.strip()

        # remove extra '(' ')' until the ordering does make sense
        for idx, char in enumerate(expression):
            if char == '(':
                # check the new string practises
                stack_char = []
                have_error = False
                for char_test in expression[1:-1]:
                    if char_test == '(':
                        stack_char.append(char_test)
                    elif char_test == ')':
                        if len(stack_char) == 0:
                            have_error = True
                            break
                        else:
                            stack_char.pop()
                if have_error:
                    break
                else:
                    expression = expression[1:-1]
                    index += 1
            else:
                break

        # find the next operator to split by that character
        # ordering of ( and ) should be checked to not select the inside operator
        split_index = None
        stack_char = []
        for idx, char in enumerate(expression):
            if char == '(':
                stack_char.append(char)
                continue
            elif char == ')':
                stack_char.pop()
                continue
            else:
                if char.isalpha():
                    continue
                else:
                    if len(stack_char) == 0:
                        split_index = idx
                        break

        # create the parent by operator
        parent = BinaryTreeNode(expression[split_index], index + split_index, True)
        # get left and right of operator in expression
        left, right = expression[:split_index], expression[split_index + 1:]

        # left of the operator in expression can be empty because we have ~ operator
        if left != '' and left:
            if left.isalpha():
                # end of tree which is only character left
                parent.left = BinaryTreeNode(left, index, False)
            else:
                # left node should be created recursively
                parent.left = self.get_node_from_expression(left, index)

        if right != '' and right:
            if right.isalpha():
                # end of tree which is only character right
                parent.right = BinaryTreeNode(right, index + split_index + 1, False)
            else:
                # right node should be created recursively
                parent.right = self.get_node_from_expression(right, index + split_index + 1)

        return parent

    @staticmethod
    def compare_trees(correct_tree: BinaryTreeNode, user_tree: BinaryTreeNode):
        error = None

        if correct_tree.right:
            if user_tree.right:
                error = BooleanTree.compare_trees(correct_tree.right, user_tree.right)
                if error is not None:
                    return error
            else:
                error = user_tree.index
                return error

        if correct_tree.left:
            if user_tree.left:
                error = BooleanTree.compare_trees(correct_tree.left, user_tree.left)
                if error is not None:
                    return error
            else:
                error = user_tree.index
                return error

        # the not operators will not be checked at their level
        # they will be checked the parent
        if correct_tree.operator:
            return None

        # check the operator's value at first
        if correct_tree.value != user_tree.value:
            error = user_tree.index
            return error

        # check the operator's left child
        if correct_tree.left and user_tree.left:
            if correct_tree.left.value != user_tree.left.value:
                # check if the left node of the teacher is equal to right node of user tree in case of p&q is equal
                # to q&p
                if not (user_tree.right and correct_tree.left.value == user_tree.right.value):
                    # this means that the right not found or the right and left were not equal so we are facing an
                    # error here
                    error = user_tree.left.index
                    return error

        # check the operator's right child
        if correct_tree.right and user_tree.right:
            if correct_tree.right.value != user_tree.right.value:
                # check if the left node of the teacher is equal to right node of user tree in case of p&q is equal
                # to q&p
                if not (user_tree.left and correct_tree.right.value == user_tree.left.value):
                    # this means that the left not found or the right and left were not equal, so we are facing an
                    # error here
                    error = user_tree.right.index
                    return error

    def print_expression_tree_tree_format(self, root=None, indent=0):
        if not root:
            root = self.tree

        if root.value.isalpha():
            print(" " * indent + root.value)
        else:
            print(" " * indent + root.value)
            if root.left:
                self.print_expression_tree_tree_format(root.left, indent + 4)
            if root.right:
                self.print_expression_tree_tree_format(root.right, indent + 4)
