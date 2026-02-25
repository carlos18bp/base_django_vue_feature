import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status


@pytest.fixture
def staff_user(db):
    User = get_user_model()
    user = User.objects.create_user(email='staff@example.com', password='pass1234')
    user.is_staff = True
    user.save(update_fields=['is_staff'])
    return user


@pytest.mark.django_db
def test_users_list_rejects_unauthenticated(api_client):
    url = reverse('list-users')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_users_list_success_for_staff(api_client, staff_user):
    api_client.force_authenticate(user=staff_user)
    url = reverse('list-users')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_products_create_rejects_unauthenticated(api_client):
    url = reverse('create-product')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_blogs_create_rejects_unauthenticated(api_client):
    url = reverse('create-blog')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_sales_list_rejects_unauthenticated(api_client):
    url = reverse('list-sales')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
