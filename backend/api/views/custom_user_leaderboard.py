from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, F

from api.models import Progress


class CustomUserLeaderboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Retrieve users with their total stars and total level completions
        leaderboard = Progress.objects\
            .filter(user__class_related=request.user.class_related)\
            .filter(scenario__class_related=request.user.class_related)\
            .values('user')\
            .annotate(username=F('user__username'))\
            .annotate(avatar=F('user__avatar'))

        # Sum the stars for each user
        leaderboard = leaderboard.annotate(total_stars=Sum('stars'))

        # Count the number of levels completed by the user, using the 'time' field to exclude information levels
        leaderboard = leaderboard.annotate(total_levels=Count('time'))

        # Customize the response data as needed
        response_data = {
            "leaderboard": leaderboard.filter(total_levels__gt=0)
        }

        return Response(response_data)
