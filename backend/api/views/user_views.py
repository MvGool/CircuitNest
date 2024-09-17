from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class UserLanguageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        user.language = request.data.get('language')
        print(user.language)
        user.save()

        return Response({'msg': 'language updated'}, status=200)
