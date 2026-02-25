import pytest

from django_attachments.models import Library

from base_feature_app.models import Blog, Product, Sale, SoldProduct


@pytest.mark.django_db
def test_blog_delete_handles_missing_library(monkeypatch):
    lib = Library.objects.create(title="Blog Lib")
    blog = Blog.objects.create(title="B", description="D", category="C", image=lib)

    def fake_delete(self):
        raise Library.DoesNotExist()

    monkeypatch.setattr(Library, "delete", fake_delete)

    # Should not raise even though Library.DoesNotExist is thrown
    blog.delete()
    assert not Blog.objects.filter(id=blog.id).exists()


@pytest.mark.django_db
def test_product_delete_handles_missing_library(monkeypatch):
    """Verifies that product deletion silently ignores Library.DoesNotExist and still removes the product."""
    lib = Library.objects.create(title="Prod Lib")
    product = Product.objects.create(
        title="P",
        category="C",
        sub_category="S",
        description="D",
        price=10,
        gallery=lib,
    )

    def fake_delete(self):
        raise Library.DoesNotExist()

    monkeypatch.setattr(Library, "delete", fake_delete)

    # Should not raise even though Library.DoesNotExist is thrown
    product.delete()
    assert not Product.objects.filter(id=product.id).exists()


@pytest.mark.django_db
def test_sale_delete_also_deletes_sold_products(db):
    """Verifies that deleting a Sale cascades to remove associated SoldProducts."""
    product = Product.objects.create(
        title="P2",
        category="C",
        sub_category="S",
        description="D",
        price=20,
        gallery=Library.objects.create(title="G"),
    )
    sold = SoldProduct.objects.create(product=product, quantity=2)
    sale = Sale.objects.create(
        email="buyer@example.com",
        address="Street 1",
        city="City",
        state="State",
        postal_code="12345",
    )
    sale.sold_products.add(sold)

    sale.delete()

    assert not SoldProduct.objects.filter(id=sold.id).exists()
