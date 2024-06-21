from rest_framework import serializers
from base_feature_app.models import Blog

class BlogSerializer(serializers.ModelSerializer):
    """
    Blog serializer.

    Serializes and deserializes Blog instances.
    """

    class Meta:
        model = Blog
        fields = '__all__'
