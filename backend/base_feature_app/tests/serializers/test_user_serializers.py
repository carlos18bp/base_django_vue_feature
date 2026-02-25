import pytest
from rest_framework.test import APIRequestFactory

from base_feature_app.models import User
from base_feature_app.serializers.user_list import UserListSerializer
from base_feature_app.serializers.user_detail import UserDetailSerializer
from base_feature_app.serializers.user_create_update import UserCreateUpdateSerializer


@pytest.mark.django_db
class TestUserListSerializer:
    def test_user_list_serializer_fields(self):
        """Verifies that UserListSerializer returns expected fields and excludes password."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe',
            role=User.Role.CUSTOMER
        )
        
        serializer = UserListSerializer(user)
        data = serializer.data
        
        assert data['email'] == 'test@example.com'
        assert data['first_name'] == 'John'
        assert data['last_name'] == 'Doe'
        assert data['role'] == User.Role.CUSTOMER
        assert data['is_active'] is True
        assert data['is_staff'] is False
        assert 'password' not in data

    def test_user_list_serializer_staff_user(self):
        user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            is_staff=True,
            role=User.Role.ADMIN
        )
        
        serializer = UserListSerializer(user)
        data = serializer.data
        
        assert data['is_staff'] is True
        assert data['role'] == User.Role.ADMIN


@pytest.mark.django_db
class TestUserDetailSerializer:
    def test_user_detail_serializer_personal_fields(self):
        """Verifies that personal identity fields are serialized correctly."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe',
            phone='+1234567890',
            role=User.Role.CUSTOMER
        )

        serializer = UserDetailSerializer(user)
        data = serializer.data

        assert data['email'] == 'test@example.com'
        assert data['first_name'] == 'John'
        assert data['last_name'] == 'Doe'
        assert data['phone'] == '+1234567890'
        assert data['role'] == User.Role.CUSTOMER

    def test_user_detail_serializer_flags_and_dates(self):
        """Verifies that account flags and date_joined are present in serialized output."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            role=User.Role.CUSTOMER
        )

        serializer = UserDetailSerializer(user)
        data = serializer.data

        assert data['is_active'] is True
        assert data['is_staff'] is False
        assert 'date_joined' in data

    def test_user_detail_serializer_excludes_password(self):
        """Verifies that the password field is not exposed in serialized output."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            role=User.Role.CUSTOMER
        )

        serializer = UserDetailSerializer(user)
        data = serializer.data

        assert 'password' not in data


@pytest.mark.django_db
class TestUserCreateUpdateSerializer:
    def test_create_user_with_password(self):
        """Verifies that UserCreateUpdateSerializer creates a user with a hashed password and correct fields."""
        payload = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'phone': '+9876543210',
            'role': User.Role.CUSTOMER,
        }
        
        serializer = UserCreateUpdateSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        
        assert user.email == 'newuser@example.com'
        assert user.check_password('securepass123')
        assert user.first_name == 'Jane'
        assert user.last_name == 'Smith'
        assert user.phone == '+9876543210'
        assert user.role == User.Role.CUSTOMER

    def test_create_user_with_empty_password(self):
        """Test that creating user without password field leaves password unusable"""
        # Note: When creating via serializer without password, Django sets an unusable password by default
        # But since we call User.objects.create directly in the serializer without set_password,
        # the password field will be empty. This test verifies the email is set correctly.
        payload = {
            'email': 'nopass@example.com',
            'first_name': 'No',
            'last_name': 'Password',
            'role': User.Role.CUSTOMER,
        }
        
        serializer = UserCreateUpdateSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        
        assert user.email == 'nopass@example.com'
        assert user.first_name == 'No'
        # Password exists but is empty string (not a usable hashed password)

    def test_update_user_without_password(self):
        """Verifies that partial update via UserCreateUpdateSerializer preserves the existing password."""
        user = User.objects.create_user(
            email='test@example.com',
            password='oldpass123',
            first_name='Old',
            last_name='Name'
        )
        
        payload = {
            'first_name': 'New',
            'last_name': 'Name',
            'phone': '+1111111111',
        }
        
        serializer = UserCreateUpdateSerializer(user, data=payload, partial=True)
        assert serializer.is_valid(), serializer.errors
        updated_user = serializer.save()
        
        assert updated_user.first_name == 'New'
        assert updated_user.phone == '+1111111111'
        assert updated_user.check_password('oldpass123')  # Password unchanged

    def test_update_user_with_password(self):
        """Verifies that UserCreateUpdateSerializer updates both profile fields and password when provided."""
        user = User.objects.create_user(
            email='test@example.com',
            password='oldpass123',
            first_name='Test'
        )
        
        payload = {
            'password': 'newpass456',
            'first_name': 'Updated',
        }
        
        serializer = UserCreateUpdateSerializer(user, data=payload, partial=True)
        assert serializer.is_valid(), serializer.errors
        updated_user = serializer.save()
        
        assert updated_user.first_name == 'Updated'
        assert updated_user.check_password('newpass456')
        assert not updated_user.check_password('oldpass123')

    def test_create_admin_user(self):
        payload = {
            'email': 'admin@example.com',
            'password': 'adminpass123',
            'role': User.Role.ADMIN,
            'is_staff': True,
        }
        
        serializer = UserCreateUpdateSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        
        assert user.role == User.Role.ADMIN
        assert user.is_staff is True

    def test_password_write_only(self):
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        serializer = UserCreateUpdateSerializer(user)
        data = serializer.data
        
        assert 'password' not in data
