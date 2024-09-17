from rest_framework import permissions
from django.core.exceptions import ObjectDoesNotExist

TEACHER_GROUP_NAME = 'Teacher'


class IsSuperAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff and request.user.is_superuser)


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)
