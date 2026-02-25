import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

from django_attachments.models import Library
from base_feature_app.models import Blog, Product, Sale, SoldProduct


@pytest.fixture
def staff_user(db):
    User = get_user_model()
    user = User.objects.create_user(email='staff3@example.com', password='pass12345')
    user.is_staff = True
    user.save(update_fields=['is_staff'])
    return user


@pytest.fixture
def staff_client(api_client, staff_user):
    api_client.force_authenticate(user=staff_user)
    return api_client


@pytest.mark.django_db
def test_blog_list_public_get(api_client):
    lib = Library.objects.create(title='Blog Library List')
    Blog.objects.create(title='B1', description='D', category='C', image=lib)

    url = reverse('list-blogs')
    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_product_list_public_get(api_client):
    """Verifies that an unauthenticated client can retrieve the product list."""
    lib = Library.objects.create(title='Prod Library List')
    Product.objects.create(
        title='P1',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=lib,
    )

    url = reverse('list-products')
    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_blog_detail_update_rejects_unauthenticated(api_client):
    lib = Library.objects.create(title='Blog Library Detail')
    blog = Blog.objects.create(title='B1', description='D', category='C', image=lib)

    url = reverse('update-blog', kwargs={'blog_id': blog.id})
    response = api_client.patch(url, {'title': 'Nope'}, format='json')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_product_detail_update_rejects_unauthenticated(api_client):
    """Verifies that PATCH on a product detail endpoint returns HTTP 401 for unauthenticated requests."""
    lib = Library.objects.create(title='Prod Library Detail')
    product = Product.objects.create(
        title='P1',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=lib,
    )

    url = reverse('update-product', kwargs={'product_id': product.id})
    response = api_client.patch(url, {'title': 'Nope'}, format='json')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_blog_detail_put_invalid_returns_400(staff_client):
    lib = Library.objects.create(title='Blog Library Put')
    blog = Blog.objects.create(title='B1', description='D', category='C', image=lib)

    url = reverse('update-blog', kwargs={'blog_id': blog.id})
    response = staff_client.put(url, {}, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_product_detail_put_invalid_returns_400(staff_client):
    """Verifies that PUT on a product detail endpoint returns HTTP 400 when the payload is invalid."""
    lib = Library.objects.create(title='Prod Library Put')
    product = Product.objects.create(
        title='P1',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=lib,
    )

    url = reverse('update-product', kwargs={'product_id': product.id})
    response = staff_client.put(url, {}, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_sale_detail_rejects_unauthenticated(api_client):
    """Verifies that GET on a sale detail endpoint returns HTTP 401 for unauthenticated requests."""
    lib = Library.objects.create(title='Sale Lib')
    product = Product.objects.create(
        title='P1',
        category='C',
        sub_category='S',
        description='D',
        price=10,
        gallery=lib,
    )
    sold = SoldProduct.objects.create(product=product, quantity=1)
    sale = Sale.objects.create(
        email='buyer@example.com',
        address='Street 1',
        city='City',
        state='State',
        postal_code='12345',
    )
    sale.sold_products.add(sold)

    url = reverse('retrieve-sale', kwargs={'sale_id': sale.id})
    response = api_client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_user_detail_put_invalid_returns_400(staff_client):
    user = get_user_model().objects.create_user(email='u1@example.com', password='pass12345')
    url = reverse('update-user', kwargs={'user_id': user.id})

    response = staff_client.put(url, {}, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
