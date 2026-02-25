from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    Allows read-only access to any request.
    Write operations (POST, PUT, PATCH, DELETE) require staff status.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsAdminUser(BasePermission):
    """
    Allows access only to staff/admin users.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
