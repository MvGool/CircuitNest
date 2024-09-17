from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models import Classroom, User
from api.custom_serializers.classroom_serializers import ClassroomSerializer


class ClassroomViewSet(ModelViewSet):
    http_method_names = ['get', 'post']
    serializer_class = ClassroomSerializer
    queryset = Classroom.objects.filter(active=True)
    permission_classes = [IsAuthenticated]

    # Override the default POST method to prevent the creation of classrooms through POST
    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Method 'POST' not allowed. In order to create new Classroom please use admin panel."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=['post'], name='enroll to classroom', permission_classes=[IsAuthenticated])
    def enroll_classroom(self, request, pk=None):
        classroom_code = request.data.get('classroom_code')
        classroom = Classroom.objects.filter(code=classroom_code).first()
        if not classroom:
            return Response({"error": "classroom_id parameter is missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=request.user.pk)
            user.class_related_id = classroom.id
            user.save()

            return Response({"message": "Successfully enrolled in the classroom."},
                            status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], name='unroll to classroom', permission_classes=[IsAuthenticated])
    def unroll_classroom(self, request, pk=None):
        if not request.user.class_related:
            return Response({"error": "You are not enrolled in any classrooms."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=request.user.pk)
            user.class_related_id = None
            user.save()

            return Response({"message": "Successfully unrolled from the classroom."},
                            status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
