import factory
from django_attachments.models import Library

from base_feature_app.models import Blog, Product, Sale, SoldProduct, User


class LibraryFactory(factory.django.DjangoModelFactory):
    """Factory for django_attachments Library (required by Product and Blog)."""

    class Meta:
        model = Library

    title = factory.Sequence(lambda n: f'Library {n}')


class UserFactory(factory.django.DjangoModelFactory):
    """Factory for regular (non-staff) users."""

    class Meta:
        model = User

    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True
    is_staff = False
    role = User.Role.CUSTOMER

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop('password', 'pass12345')
        return model_class.objects.create_user(*args, password=password, **kwargs)


class AdminUserFactory(UserFactory):
    """Factory for staff/admin users."""

    email = factory.Sequence(lambda n: f'admin{n}@example.com')
    is_staff = True
    role = User.Role.ADMIN


class ProductFactory(factory.django.DjangoModelFactory):
    """Factory for Product instances with an auto-created gallery."""

    class Meta:
        model = Product

    title = factory.Sequence(lambda n: f'Product {n}')
    category = 'Electronics'
    sub_category = 'Gadgets'
    description = factory.Faker('sentence')
    price = 100
    gallery = factory.SubFactory(LibraryFactory)


class BlogFactory(factory.django.DjangoModelFactory):
    """Factory for Blog instances with an auto-created image library."""

    class Meta:
        model = Blog

    title = factory.Sequence(lambda n: f'Blog Post {n}')
    description = factory.Faker('paragraph')
    category = 'Tech'
    image = factory.SubFactory(LibraryFactory)


class SoldProductFactory(factory.django.DjangoModelFactory):
    """Factory for SoldProduct (cart line item)."""

    class Meta:
        model = SoldProduct

    product = factory.SubFactory(ProductFactory)
    quantity = 1


class SaleFactory(factory.django.DjangoModelFactory):
    """Factory for Sale (checkout order)."""

    class Meta:
        model = Sale

    email = factory.Faker('email')
    address = factory.Faker('street_address')
    city = factory.Faker('city')
    state = factory.Faker('state')
    postal_code = factory.Faker('postcode')
