import pytest
from django.db.models.deletion import ProtectedError

from base_feature_app.models import Product, Sale, SoldProduct
from django_attachments.models import Library


@pytest.mark.django_db
class TestSaleModel:
    def test_sale_delete_removes_sold_products(self):
        """Verifies that deleting a Sale cascades to remove its associated SoldProducts."""
        gallery = Library.objects.create(title='Gallery')
        product = Product.objects.create(
            title='Product',
            category='Candles',
            sub_category='Modern',
            description='Description',
            price=100,
            gallery=gallery,
        )

        sold = SoldProduct.objects.create(product=product, quantity=1)
        sale = Sale.objects.create(
            email='customer@example.com',
            address='123 Main St',
            city='City',
            state='State',
            postal_code='12345'
        )
        sale.sold_products.add(sold)

        sold_id = sold.id
        sale.delete()

        assert not SoldProduct.objects.filter(id=sold_id).exists()

    def test_sale_creation(self):
        sale = Sale.objects.create(
            email='test@example.com',
            address='456 Oak Avenue',
            city='New York',
            state='NY',
            postal_code='10001'
        )
        
        assert sale.email == 'test@example.com'
        assert sale.address == '456 Oak Avenue'
        assert sale.city == 'New York'
        assert sale.state == 'NY'
        assert sale.postal_code == '10001'

    def test_sale_str_representation(self):
        sale = Sale.objects.create(
            email='display@example.com',
            address='Address',
            city='City',
            state='State',
            postal_code='12345'
        )
        assert str(sale) == 'display@example.com'

    def test_sale_with_multiple_products(self):
        """Verifies that a Sale can hold multiple SoldProducts and reports the correct count."""
        gallery = Library.objects.create(title='Gallery')
        product1 = Product.objects.create(
            title='Product 1',
            category='C1',
            sub_category='S1',
            description='D1',
            price=100,
            gallery=gallery,
        )
        product2 = Product.objects.create(
            title='Product 2',
            category='C2',
            sub_category='S2',
            description='D2',
            price=200,
            gallery=gallery,
        )

        sold1 = SoldProduct.objects.create(product=product1, quantity=2)
        sold2 = SoldProduct.objects.create(product=product2, quantity=3)
        
        sale = Sale.objects.create(
            email='multi@example.com',
            address='789 Pine St',
            city='Los Angeles',
            state='CA',
            postal_code='90001'
        )
        sale.sold_products.add(sold1, sold2)

        assert sale.sold_products.count() == 2


@pytest.mark.django_db
class TestSoldProductModel:
    def test_sold_product_creation(self):
        """Verifies that a SoldProduct is created with the correct product reference and quantity."""
        gallery = Library.objects.create(title='Gallery')
        product = Product.objects.create(
            title='Product',
            category='Category',
            sub_category='SubCategory',
            description='Description',
            price=150,
            gallery=gallery,
        )

        sold_product = SoldProduct.objects.create(product=product, quantity=5)
        
        assert sold_product.product == product
        assert sold_product.quantity == 5

    def test_sold_product_str_representation(self):
        gallery = Library.objects.create(title='Gallery')
        product = Product.objects.create(
            title='Display Product',
            category='Cat',
            sub_category='Sub',
            description='Desc',
            price=100,
            gallery=gallery,
        )

        sold_product = SoldProduct.objects.create(product=product, quantity=3)
        assert str(sold_product) == 'Display Product (Qty: 3)'

    def test_sold_product_protect_on_product_delete(self):
        """Verifies that attempting to delete a referenced Product raises ProtectedError."""
        gallery = Library.objects.create(title='Gallery')
        product = Product.objects.create(
            title='Protected Product',
            category='Cat',
            sub_category='Sub',
            description='Desc',
            price=100,
            gallery=gallery,
        )

        sold_product = SoldProduct.objects.create(product=product, quantity=1)
        
        # Trying to delete product should raise ProtectedError because of PROTECT
        with pytest.raises(ProtectedError):
            product.delete()
        
        # SoldProduct should still exist
        assert SoldProduct.objects.filter(id=sold_product.id).exists()
