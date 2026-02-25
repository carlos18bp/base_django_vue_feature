import pytest
from django_attachments.models import Library
from rest_framework.test import APIClient

from base_feature_app.models import Blog, Product, User


@pytest.fixture
def api_client():
    """Unauthenticated DRF test client."""
    return APIClient()


@pytest.fixture
def user(db):
    """Regular (non-staff) active user."""
    return User.objects.create_user(
        email='user@example.com',
        password='pass12345',
        first_name='Regular',
        last_name='User',
    )


@pytest.fixture
def admin_user(db):
    """Staff/admin active user."""
    u = User.objects.create_user(
        email='admin@example.com',
        password='pass12345',
        first_name='Admin',
        last_name='User',
    )
    u.is_staff = True
    u.save(update_fields=['is_staff'])
    return u


@pytest.fixture
def authenticated_client(api_client, user):
    """DRF client authenticated as a regular user."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """DRF client authenticated as a staff/admin user."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def library(db):
    """A reusable django_attachments Library instance."""
    return Library.objects.create(title='Test Library')


@pytest.fixture
def product(db, library):
    """A minimal Product instance with a gallery."""
    return Product.objects.create(
        title='Test Product',
        category='Category',
        sub_category='Sub',
        description='A test product.',
        price=100,
        gallery=library,
    )


@pytest.fixture
def blog(db):
    """A minimal Blog instance with a single-image attachment."""
    lib = Library.objects.create(title='Blog Library')
    return Blog.objects.create(
        title='Test Blog',
        description='A test blog post.',
        category='Tech',
        image=lib,
    )
