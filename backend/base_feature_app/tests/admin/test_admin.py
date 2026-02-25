# quality: disable misplaced_file (admin tests live in admin/ subdirectory by design)
from django.contrib.auth import get_user_model
from django.test import RequestFactory
import pytest

from base_feature_app.admin import (
    BlogAdmin,
    ProductAdmin,
    SaleAdmin,
    BaseFeatureUserAdmin,
    BaseFeatureAdminSite,
)
from base_feature_app.models import Blog, Product, Sale, SoldProduct
from django_attachments.models import Library


def _staff_request(db):  # pragma: no cover - trivial helper
    User = get_user_model()
    user = User.objects.create_superuser(email="admin@example.com", password="pass12345")
    factory = RequestFactory()
    request = factory.get("/admin/")
    request.user = user
    return request


def test_blogadmin_delete_queryset_deletes_objects(db):
    request = _staff_request(db)
    lib = Library.objects.create(title="BLog Lib")
    Blog.objects.create(title="B1", description="D", category="C", image=lib)
    admin = BlogAdmin(Blog, None)

    admin.delete_queryset(request, Blog.objects.all())

    assert Blog.objects.count() == 0


def test_productadmin_delete_queryset_deletes_objects(db):
    """Verifies that ProductAdmin.delete_queryset removes all products from the database."""
    request = _staff_request(db)
    lib = Library.objects.create(title="Prod Lib")
    Product.objects.create(
        title="P1",
        category="C",
        sub_category="S",
        description="D",
        price=10,
        gallery=lib,
    )
    admin = ProductAdmin(Product, None)

    admin.delete_queryset(request, Product.objects.all())

    assert Product.objects.count() == 0


def test_saleadmin_total_products_and_delete_queryset(db):
    """Verifies SaleAdmin total_products count and that delete_queryset cascades to SoldProduct."""
    request = _staff_request(db)
    lib = Library.objects.create(title="Prod Lib 2")
    product = Product.objects.create(
        title="P2",
        category="C",
        sub_category="S",
        description="D",
        price=20,
        gallery=lib,
    )
    sold = SoldProduct.objects.create(product=product, quantity=3)
    sale = Sale.objects.create(
        email="buyer@example.com",
        address="Street 1",
        city="City",
        state="State",
        postal_code="12345",
    )
    sale.sold_products.add(sold)

    admin = SaleAdmin(Sale, None)

    assert admin.total_products(sale) == 1

    admin.delete_queryset(request, Sale.objects.all())

    assert Sale.objects.count() == 0
    assert SoldProduct.objects.count() == 0


@pytest.mark.django_db
def test_custom_admin_site_get_app_list_includes_sections(monkeypatch, db):
    """Verifies that the custom admin site groups models into named management sections."""
    request = _staff_request(db)
    site = BaseFeatureAdminSite(name="myadmin-test")

    # Monkeypatch _build_app_dict so we don't rely on URL reversing
    def fake_build_app_dict(self, req):
        return {
            "base_feature_app": {
                "models": [
                    {"object_name": "User"},
                    {"object_name": "Blog"},
                    {"object_name": "Product"},
                    {"object_name": "Sale"},
                    {"object_name": "SoldProduct"},
                ]
            }
        }

    monkeypatch.setattr(BaseFeatureAdminSite, "_build_app_dict", fake_build_app_dict)

    app_list = site.get_app_list(request)

    # Should group models into custom sections
    section_names = {section["app_label"] for section in app_list}
    assert "user_management" in section_names
    assert "blog_management" in section_names
    assert "product_management" in section_names
    assert "sales_management" in section_names
