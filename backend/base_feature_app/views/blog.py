from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from base_feature_app.models import Blog
from base_feature_app.serializers import BlogSerializer

@api_view(['GET'])
def blog_list(request):
    """
    List all blogs.
    """
    blogs = Blog.objects.all()
    serializer = BlogSerializer(blogs, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)