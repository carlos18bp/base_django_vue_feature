import io

import pytest
from django.core.files.base import ContentFile
from rest_framework.test import APIRequestFactory
from PIL import Image

from base_feature_app.models import Product
from base_feature_app.serializers.product_list import ProductListSerializer
from base_feature_app.serializers.product_detail import ProductDetailSerializer
from base_feature_app.serializers.product_create_update import ProductCreateUpdateSerializer
from django_attachments.models import Attachment, Library


def _placeholder_image(name='placeholder.webp'):
    image = Image.new('RGB', (10, 10), color=(240, 240, 240))
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=name)


@pytest.mark.django_db
class TestProductListSerializer:
    def test_product_list_serializer_gallery_urls_empty_without_request(self):
        gallery = Library.objects.create(title='Gallery')
        Attachment.objects.create(library=gallery, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
        product = Product.objects.create(
            title='Test Product',
            category='Candles',
            sub_category='Modern',
            description='Description',
            price=100,
            gallery=gallery,
        )

        serializer = ProductListSerializer(product)
        assert serializer.data['gallery_urls'] == []

    def test_product_list_serializer_with_request_context(self):
        """Verifies that ProductListSerializer returns absolute gallery URLs when request context is provided."""
        gallery = Library.objects.create(title='Gallery')
        Attachment.objects.create(library=gallery, file=_placeholder_image(), original_name='image1.webp', rank=0)
        Attachment.objects.create(library=gallery, file=_placeholder_image('image2.webp'), original_name='image2.webp', rank=1)
        product = Product.objects.create(
            title='Product',
            category='C',
            sub_category='S',
            description='D',
            price=100,
            gallery=gallery,
        )

        factory = APIRequestFactory()
        request = factory.get('/api/products/')

        serializer = ProductListSerializer(product, context={'request': request})
        assert len(serializer.data['gallery_urls']) == 2
        assert all(url.startswith('http://testserver/') for url in serializer.data['gallery_urls'])

    def test_product_list_serializer_without_attachments(self):
        """Verifies that ProductListSerializer returns an empty gallery_urls list when no attachments exist."""
        gallery = Library.objects.create(title='Empty Gallery')
        product = Product.objects.create(
            title='No Attachments Product',
            category='C',
            sub_category='S',
            description='D',
            price=150,
            gallery=gallery,
        )

        factory = APIRequestFactory()
        request = factory.get('/api/products/')

        serializer = ProductListSerializer(product, context={'request': request})
        assert serializer.data['gallery_urls'] == []


@pytest.mark.django_db
class TestProductDetailSerializer:
    def test_product_detail_serializer_with_gallery(self):
        """Verifies that ProductDetailSerializer includes gallery URLs and correct title/price fields."""
        gallery = Library.objects.create(title='Gallery')
        Attachment.objects.create(library=gallery, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
        product = Product.objects.create(
            title='Detail Product',
            category='Candles',
            sub_category='Greek',
            description='Detailed description',
            price=200,
            gallery=gallery,
        )

        factory = APIRequestFactory()
        request = factory.get('/api/products/1/')

        serializer = ProductDetailSerializer(product, context={'request': request})
        assert len(serializer.data['gallery_urls']) >= 1
        assert serializer.data['title'] == 'Detail Product'
        assert float(serializer.data['price']) == 200.0


@pytest.mark.django_db
class TestProductCreateUpdateSerializer:
    def test_create_product(self):
        """Verifies that ProductCreateUpdateSerializer creates a Product with the correct fields."""
        gallery = Library.objects.create(title='Product Gallery')
        
        payload = {
            'title': 'New Product',
            'category': 'Aesthetic Candles',
            'sub_category': 'Greek Sculptures',
            'description': 'New Description',
            'price': 150,
            'gallery': gallery.id
        }

        serializer = ProductCreateUpdateSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors
        product = serializer.save()

        assert product.title == 'New Product'
        assert product.category == 'Aesthetic Candles'
        from decimal import Decimal
        assert product.price == Decimal('150')
        assert product.gallery == gallery

    def test_update_product(self):
        """Verifies that ProductCreateUpdateSerializer partially updates a Product's price and title."""
        gallery = Library.objects.create(title='Old Gallery')
        product = Product.objects.create(
            title='Old Title',
            category='Old Cat',
            sub_category='Old Sub',
            description='Old Desc',
            price=100,
            gallery=gallery
        )

        payload = {
            'title': 'Updated Product',
            'price': 250,
        }

        serializer = ProductCreateUpdateSerializer(product, data=payload, partial=True)
        assert serializer.is_valid(), serializer.errors
        updated_product = serializer.save()

        assert updated_product.title == 'Updated Product'
        from decimal import Decimal
        assert updated_product.price == Decimal('250')
        assert updated_product.category == 'Old Cat'  # Unchanged
