from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from base_feature_app.models import Blog
from base_feature_app.permissions import IsAdminOrReadOnly
from base_feature_app.serializers.blog_create_update import BlogCreateUpdateSerializer
from base_feature_app.serializers.blog_detail import BlogDetailSerializer
from base_feature_app.serializers.blog_list import BlogListSerializer


@api_view(['GET'])
@permission_classes([IsAdminOrReadOnly])
def list_blogs(request):
    """
    Return a list of all blogs.
    """
    queryset = Blog.objects.all().order_by('-id')
    serializer = BlogListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminOrReadOnly])
def create_blog(request):
    """
    Create a new blog entry. Staff only.
    """
    serializer = BlogCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        blog = serializer.save()
        detail = BlogDetailSerializer(blog, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOrReadOnly])
def retrieve_blog(request, blog_id: int):
    """
    Return the detail of a single blog entry.
    """
    try:
        blog = Blog.objects.get(id=blog_id)
    except Blog.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = BlogDetailSerializer(blog, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminOrReadOnly])
def update_blog(request, blog_id: int):
    """
    Update an existing blog entry (full or partial). Staff only.
    """
    try:
        blog = Blog.objects.get(id=blog_id)
    except Blog.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = BlogCreateUpdateSerializer(
        blog, data=request.data, partial=(request.method == 'PATCH')
    )
    if serializer.is_valid():
        blog = serializer.save()
        detail = BlogDetailSerializer(blog, context={'request': request})
        return Response(detail.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminOrReadOnly])
def delete_blog(request, blog_id: int):
    """
    Delete a blog entry by ID. Staff only.
    """
    try:
        blog = Blog.objects.get(id=blog_id)
    except Blog.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    blog.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
