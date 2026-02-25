import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError


User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_user_default_role_customer(self):
        user = User.objects.create_user(email='user@example.com', password='pass1234')
        assert user.role == User.Role.CUSTOMER
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_superuser_sets_admin_role(self):
        admin = User.objects.create_superuser(email='admin@example.com', password='pass1234')
        assert admin.is_staff is True
        assert admin.is_superuser is True
        assert admin.is_active is True
        assert admin.role == User.Role.ADMIN

    def test_create_superuser_requires_staff_true(self):
        with pytest.raises(ValueError, match='is_staff=True'):
            User.objects.create_superuser(
                email='badstaff@example.com',
                password='pass1234',
                is_staff=False,
            )
        assert not User.objects.filter(email='badstaff@example.com').exists()

    def test_create_superuser_requires_superuser_true(self):
        with pytest.raises(ValueError, match='is_superuser=True'):
            User.objects.create_superuser(
                email='badroot@example.com',
                password='pass1234',
                is_superuser=False,
            )
        assert not User.objects.filter(email='badroot@example.com').exists()

    def test_user_str_representation(self):
        user = User.objects.create_user(email='test@example.com', password='pass1234')
        assert str(user) == 'test@example.com'

    def test_user_with_full_details(self):
        user = User.objects.create_user(
            email='full@example.com',
            password='pass1234',
            first_name='John',
            last_name='Doe',
            phone='+1234567890'
        )
        assert user.email == 'full@example.com'
        assert user.first_name == 'John'
        assert user.last_name == 'Doe'
        assert user.phone == '+1234567890'

    def test_user_email_is_unique(self):
        User.objects.create_user(email='unique@example.com', password='pass1234')
        with pytest.raises(IntegrityError) as excinfo:
            User.objects.create_user(email='unique@example.com', password='pass5678')
        assert issubclass(excinfo.type, IntegrityError)

    def test_user_without_email_raises_error(self):
        with pytest.raises(ValueError, match='The Email field must be set'):
            User.objects.create_user(email='', password='pass1234')
        assert not User.objects.filter(email='').exists()

    def test_user_roles_choices(self):
        assert User.Role.CUSTOMER == 'customer'
        assert User.Role.ADMIN == 'admin'

    def test_user_password_hashing(self):
        user = User.objects.create_user(email='hash@example.com', password='plainpass')
        assert user.password != 'plainpass'
        assert user.check_password('plainpass')

    def test_admin_user_role(self):
        admin = User.objects.create_user(
            email='admin2@example.com',
            password='pass1234',
            role=User.Role.ADMIN,
            is_staff=True
        )
        assert admin.role == User.Role.ADMIN
        assert admin.is_staff is True
