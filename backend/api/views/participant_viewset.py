from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models import Participant
from api.custom_serializers.participant_serializers \
    import ParticipantSerializer, AddParticipantSerializer, UpdateParticipantSerializer


class ParticipantViewSet(ModelViewSet):
    """
        /participants : Auth
        GET: get list of participants  -> will get own participant
        POST: add new object
            can add new object base on new scenario and level id (desired fields: ['scenario', 'level', 'final_score', 'total_time'])

        /participants/:id : Auth
        GET: get certain object
            if that object belongs to that user will respond the object if not will get 404
        Patch: update participants
            can edit only its own objects (count, final_score, total_time)

        /participants/:id/increase_count : Auth
        POST: increase count number by one
            user can increase the count by sending ID of participate object in url
    """

    http_method_names = ['get', 'post', 'patch']
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddParticipantSerializer
        elif self.request.method == 'PATCH':
            return UpdateParticipantSerializer
        else:
            return ParticipantSerializer

    def get_queryset(self):
        queryset = Participant.objects.select_related('user').filter(user_id=self.request.user.id)
        if self.request.user.class_related:
            queryset = queryset.filter(class_related_id=self.request.user.class_related)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = AddParticipantSerializer(
            data=request.data,
            context={'user_id': self.request.user.id, 'related_class': self.request.user.class_related_id}
        )
        serializer.is_valid(raise_exception=True)
        participant = serializer.save()
        serializer = ParticipantSerializer(participant)
        return Response(serializer.data)

    # TODO: this router should change to 'retake' and in this retake should get new time and calculate \
    #  the new score and increase counter, so no need for updating routers
    @action(detail=True, methods=['post'], name='increase participant count', permission_classes=[IsAuthenticated])
    def increase_count(self, request, pk):
        participant = self.get_object()
        participant.count += 1
        participant.save()
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
