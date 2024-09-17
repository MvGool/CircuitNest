from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from api.models import InformationLevel, Progress
from api.custom_serializers.level_serializers import InformationLevelSerializer


class InformationGuideView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        information_levels = InformationLevel.objects.all()
        information_levels_completed = Progress.objects.filter(user=user, level__in=information_levels)

        serializer = InformationLevelSerializer([progress.level for progress in information_levels_completed], many=True, context={'request': request})

        return Response(serializer.data, status=200)
