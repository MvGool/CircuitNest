from rest_framework import serializers


class UserSummarySerializer(serializers.Field):
    def to_representation(self, value):
        return {
            'id': value.id,
            'first_name': value.first_name,
            'last_name': value.last_name,
        }
