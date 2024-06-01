from rest_framework import serializers
from base_feature_app.models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'ref', 'name', 'description', 'price', 'category', 'gallery']
