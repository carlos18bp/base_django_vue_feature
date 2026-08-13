"""Permission smoke tests for the backoffice users, sales, products and blogs CRUD endpoints."""

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status


@pytest.fixture
def staff_user(db):
    """Create and return a staff (is_staff=True) user for admin-only endpoint tests."""
    User = get_user_model()
    user = User.objects.create_user(email='staff@example.com', password='pass1234')
    user.is_staff = True
    user.save(update_fields=['is_staff'])
    return user


@pytest.mark.django_db
def test_users_list_rejects_unauthenticated(api_client):
    """Verify that the users-list endpoint rejects unauthenticated requests."""
    url = reverse('list-users')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_users_list_success_for_staff(api_client, staff_user):
    """Verify that a staff user can successfully list users."""
    api_client.force_authenticate(user=staff_user)
    url = reverse('list-users')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_users_list_rejects_non_staff_authenticated(api_client, user):
    """Regression guard for the users-list permission check.

    Fails if IsAdminUser regresses to IsAuthenticated, letting any
    logged-in non-staff customer read the full user list (privilege
    escalation).
    """
    api_client.force_authenticate(user=user)
    url = reverse('list-users')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_products_create_rejects_unauthenticated(api_client):
    """Verify that the product-create endpoint rejects unauthenticated requests."""
    url = reverse('create-product')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_blogs_create_rejects_unauthenticated(api_client):
    """Verify that the blog-create endpoint rejects unauthenticated requests."""
    url = reverse('create-blog')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_sales_list_rejects_unauthenticated(api_client):
    """Verify that the sales-list endpoint rejects unauthenticated requests."""
    url = reverse('list-sales')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_sales_list_rejects_non_staff_authenticated(api_client, user):
    """Regression guard for the sales-list permission check.

    Fails if IsAdminUser regresses to IsAuthenticated, leaking customer
    PII (email/address/city/state/postal_code via SaleListSerializer) to
    any authenticated non-staff user.
    """
    api_client.force_authenticate(user=user)
    url = reverse('list-sales')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN
