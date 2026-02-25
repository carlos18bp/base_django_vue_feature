from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from base_feature_app.models import User
from base_feature_app.permissions import IsAdminUser
from base_feature_app.serializers.user_create_update import UserCreateUpdateSerializer
from base_feature_app.serializers.user_detail import UserDetailSerializer
from base_feature_app.serializers.user_list import UserListSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_users(request):
    """
    Return a list of all users. Staff only.
    """
    queryset = User.objects.all().order_by('-id')
    serializer = UserListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_user(request):
    """
    Create a new user. Staff only.
    """
    serializer = UserCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        detail = UserDetailSerializer(user, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def retrieve_user(request, user_id: int):
    """
    Return the detail of a single user. Staff only.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserDetailSerializer(user, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def update_user(request, user_id: int):
    """
    Update an existing user (full or partial). Staff only.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserCreateUpdateSerializer(
        user, data=request.data, partial=(request.method == 'PATCH')
    )
    if serializer.is_valid():
        user = serializer.save()
        detail = UserDetailSerializer(user, context={'request': request})
        return Response(detail.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id: int):
    """
    Delete a user by ID. Staff only.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
