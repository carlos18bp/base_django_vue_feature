from rest_framework import serializers

from base_feature_app.models import Product


class ProductListSerializer(serializers.ModelSerializer):
    gallery_urls = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'title', 'category', 'sub_category', 'price', 'gallery_urls')

    def get_gallery_urls(self, obj):
        request = self.context.get('request')
        if not request:
            return []
        if obj.gallery:
            attachments = obj.gallery.attachment_set.order_by('rank', 'id')
            return [request.build_absolute_uri(a.file.url) for a in attachments]
        return []
