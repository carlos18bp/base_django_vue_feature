import argparse
import builtins
import io

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from django_attachments.models import Attachment, Library

from base_feature_app.management.commands import create_fake_blogs as create_blogs_module
from base_feature_app.management.commands import create_fake_data as create_fake_data_module
from base_feature_app.management.commands import create_fake_products as create_products_module
from base_feature_app.management.commands import test_email as test_email_module
from base_feature_app.models import Blog, Product, Sale, SoldProduct, User


@pytest.mark.django_db
def test_create_users_command_creates_users():
    call_command('create_fake_users', number_of_users=1)

    assert User.objects.count() == 1


@pytest.mark.django_db
def test_create_blogs_command_creates_placeholder_image(monkeypatch):
    monkeypatch.setattr(create_blogs_module.os.path, 'isfile', lambda path: False)

    call_command('create_fake_blogs', number_of_blogs=1)

    assert Blog.objects.count() == 1
    assert Attachment.objects.count() == 1


@pytest.mark.django_db
def test_create_blogs_command_uses_existing_image(monkeypatch):
    """Verifies that create_fake_blogs reuses an existing image file instead of generating a placeholder."""
    monkeypatch.setattr(
        create_blogs_module.os.path,
        'isfile',
        lambda path: path.endswith('image_temp1.webp'),
    )
    real_open = builtins.open

    def fake_open(path, mode='rb', *args, **kwargs):
        if path.endswith('image_temp1.webp'):
            return io.BytesIO(b'fake-image')
        return real_open(path, mode, *args, **kwargs)

    monkeypatch.setattr(builtins, 'open', fake_open)
    monkeypatch.setattr(create_blogs_module.random, 'choice', lambda seq: seq[0])

    call_command('create_fake_blogs', number_of_blogs=1)

    assert Blog.objects.count() == 1
    assert Attachment.objects.count() == 1


@pytest.mark.django_db
def test_create_products_command_creates_placeholder_images(monkeypatch):
    monkeypatch.setattr(create_products_module.os.path, 'isfile', lambda path: False)

    call_command('create_fake_products', number_of_products=1)

    assert Product.objects.count() == 1
    assert Attachment.objects.count() == 4


@pytest.mark.django_db
def test_create_products_command_uses_existing_images(monkeypatch):
    """Verifies that create_fake_products reuses existing image files instead of generating placeholders."""
    monkeypatch.setattr(create_products_module.os.path, 'isfile', lambda path: True)
    real_open = builtins.open

    def fake_open(path, mode='rb', *args, **kwargs):
        if path.endswith('.webp'):
            return io.BytesIO(b'fake-image')
        return real_open(path, mode, *args, **kwargs)

    monkeypatch.setattr(builtins, 'open', fake_open)
    monkeypatch.setattr(create_products_module.random, 'randrange', lambda n: 0)

    call_command('create_fake_products', number_of_products=1)

    assert Product.objects.count() == 1
    assert Attachment.objects.count() == 4


@pytest.mark.django_db
def test_create_sales_command_no_products():
    call_command('create_fake_sales', number_of_sales=1)

    assert Sale.objects.count() == 0


@pytest.mark.django_db
def test_create_sales_command_creates_sale():
    """Verifies that create_fake_sales creates a Sale and associated SoldProduct when products exist."""
    gallery = Library.objects.create(title='Sale Gallery')
    product = Product.objects.create(
        title='Product',
        category='Cat',
        sub_category='Sub',
        description='Desc',
        price=50,
        gallery=gallery,
    )

    call_command('create_fake_sales', number_of_sales=1)

    assert Sale.objects.count() == 1
    assert SoldProduct.objects.count() == 1
    assert SoldProduct.objects.first().product == product


def test_create_fake_data_command_uses_number_of_records(monkeypatch):
    """Verifies that create_fake_data dispatches number_of_records to all sub-commands when no explicit counts are given."""
    calls = []

    def fake_call_command(name, **kwargs):
        calls.append((name, kwargs))

    monkeypatch.setattr(create_fake_data_module, 'call_command', fake_call_command)

    command = create_fake_data_module.Command()
    command.handle(number_of_records=2, blogs=1, products=1, sales=1, users=1)

    assert calls == [
        ('create_fake_users', {'number_of_users': 2}),
        ('create_fake_blogs', {'number_of_blogs': 2}),
        ('create_fake_products', {'number_of_products': 2}),
        ('create_fake_sales', {'number_of_sales': 2}),
    ]


def test_create_fake_data_command_uses_explicit_counts(monkeypatch):
    """Verifies that create_fake_data uses per-entity counts when explicit values are provided."""
    calls = []

    def fake_call_command(name, **kwargs):
        calls.append((name, kwargs))

    monkeypatch.setattr(create_fake_data_module, 'call_command', fake_call_command)

    command = create_fake_data_module.Command()
    command.handle(number_of_records=None, blogs=3, products=4, sales=5, users=6)

    assert calls == [
        ('create_fake_users', {'number_of_users': 6}),
        ('create_fake_blogs', {'number_of_blogs': 3}),
        ('create_fake_products', {'number_of_products': 4}),
        ('create_fake_sales', {'number_of_sales': 5}),
    ]


def test_create_fake_data_add_arguments_defaults():
    parser = argparse.ArgumentParser()
    command = create_fake_data_module.Command()

    command.add_arguments(parser)

    args = parser.parse_args([])
    assert args.number_of_records is None
    assert args.blogs == 10
    assert args.products == 10
    assert args.sales == 10
    assert args.users == 10


@pytest.mark.django_db
def test_delete_fake_data_requires_confirm():
    with pytest.raises(CommandError) as exc_info:
        call_command('delete_fake_data')
    assert exc_info.type is CommandError


@pytest.mark.django_db
def test_delete_fake_data_command_deletes_records():
    """Verifies that delete_fake_data removes non-staff users, sales, products, and blogs while preserving staff and superusers."""
    product_gallery = Library.objects.create(title='Product Gallery')
    product = Product.objects.create(
        title='Product',
        category='Cat',
        sub_category='Sub',
        description='Desc',
        price=20,
        gallery=product_gallery,
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

    blog_library = Library.objects.create(title='Blog Image')
    Blog.objects.create(
        title='Blog',
        description='Desc',
        category='Cat',
        image=blog_library,
    )

    User.objects.create_user(email='user@example.com', password='pass12345')
    User.objects.create_user(email='staff@example.com', password='pass12345', is_staff=True)
    User.objects.create_superuser(email='admin@example.com', password='pass12345')

    call_command('delete_fake_data', confirm=True)

    assert Sale.objects.count() == 0
    assert SoldProduct.objects.count() == 0
    assert Blog.objects.count() == 0
    assert Product.objects.count() == 0
    assert User.objects.filter(is_staff=False, is_superuser=False).count() == 0
    assert User.objects.filter(is_staff=True).count() == 2
    assert User.objects.filter(is_superuser=True).count() == 1


def test_test_email_command_runs_script(monkeypatch):
    calls = {"ran": False}

    class DummyModule:
        def run_email_test(self):
            calls["ran"] = True

    monkeypatch.setattr(test_email_module, "load_email_test_module", lambda: DummyModule())

    call_command('test_email')

    assert calls["ran"] is True


def test_test_email_command_raises_error_from_script(monkeypatch):
    class DummyModule:
        def run_email_test(self):
            raise RuntimeError("smtp failure")

    monkeypatch.setattr(test_email_module, "load_email_test_module", lambda: DummyModule())

    with pytest.raises(RuntimeError) as exc_info:
        call_command('test_email')

    assert "smtp failure" in str(exc_info.value)
