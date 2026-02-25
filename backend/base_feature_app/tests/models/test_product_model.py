import io

import pytest
from django.core.files.base import ContentFile
from PIL import Image

from base_feature_app.models import Product
from django_attachments.models import Attachment, Library


def _placeholder_image(name='placeholder.webp'):
    image = Image.new('RGB', (10, 10), color=(240, 240, 240))
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=name)


@pytest.mark.django_db
class TestProductModel:
    def test_product_delete_removes_library_and_attachments(self):
        """Verifies that deleting a Product also removes its Gallery Library and all Attachments."""
        gallery = Library.objects.create(title='Product Gallery')
        Attachment.objects.create(library=gallery, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
        product = Product.objects.create(
            title='Test Product',
            category='Candles',
            sub_category='Greek',
            description='Description',
            price=100,
            gallery=gallery,
        )

        gallery_id = gallery.id
        product.delete()

        assert not Library.objects.filter(id=gallery_id).exists()
        assert not Attachment.objects.filter(library_id=gallery_id).exists()

    def test_product_creation(self):
        """Verifies that a Product is created with the correct field values."""
        gallery = Library.objects.create(title='Gallery')
        product = Product.objects.create(
            title='Beautiful Candle',
            category='Aesthetic Candles',
            sub_category='Greek Sculptures',
            description='A beautiful Greek sculpture candle',
            price=150,
            gallery=gallery
        )
        
        assert product.title == 'Beautiful Candle'
        assert product.category == 'Aesthetic Candles'
        assert product.sub_category == 'Greek Sculptures'
        assert product.price == 150
        assert product.gallery == gallery

    def test_product_str_representation(self):
        gallery = Library.objects.create(title='Gallery')
        product = Product.objects.create(
            title='My Product',
            category='Decor',
            sub_category='Modern',
            description='Description',
            price=200,
            gallery=gallery
        )
        assert str(product) == 'My Product'

    def test_product_price_validation(self):
        gallery = Library.objects.create(title='Gallery')
        product = Product.objects.create(
            title='Affordable Product',
            category='Candles',
            sub_category='Modern',
            description='Low price product',
            price=10,
            gallery=gallery
        )
        assert product.price == 10

    def test_product_update(self):
        """Verifies that product fields can be updated and persisted correctly."""
        gallery = Library.objects.create(title='Gallery')
        product = Product.objects.create(
            title='Original Product',
            category='Original Category',
            sub_category='Original Sub',
            description='Original Description',
            price=100,
            gallery=gallery
        )
        
        product.title = 'Updated Product'
        product.price = 250
        product.save()
        
        updated_product = Product.objects.get(id=product.id)
        assert updated_product.title == 'Updated Product'
        assert updated_product.price == 250
