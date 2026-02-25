import pytest
from unittest.mock import patch

from base_feature_app.models import User
from base_feature_app.services.auth_service import (
    authenticate_google_user,
    authenticate_user,
    register_user,
)


# ===========================================================================
# register_user
# ===========================================================================

@pytest.mark.django_db
def test_register_user_returns_user_with_correct_email():
    user = register_user(email='new@example.com', password='strongpass')

    assert user.email == 'new@example.com'
    assert isinstance(user, User)


@pytest.mark.django_db
def test_register_user_stores_first_and_last_name():
    user = register_user(
        email='named@example.com',
        password='strongpass',
        first_name='Alice',
        last_name='Smith',
    )

    assert user.first_name == 'Alice'
    assert user.last_name == 'Smith'


@pytest.mark.django_db
def test_register_user_hashes_password():
    user = register_user(email='hashed@example.com', password='strongpass')

    assert user.password != 'strongpass'
    assert user.check_password('strongpass')


@pytest.mark.django_db
def test_register_user_persists_to_database():
    register_user(email='persisted@example.com', password='strongpass')

    assert User.objects.filter(email='persisted@example.com').exists()


@pytest.mark.django_db
def test_register_user_raises_when_password_is_too_short():
    with pytest.raises(ValueError, match='Password must be at least 8 characters'):
        register_user(email='short@example.com', password='abc123')

    assert not User.objects.filter(email='short@example.com').exists()


@pytest.mark.django_db
def test_register_user_raises_when_email_already_exists():
    User.objects.create_user(email='dup@example.com', password='strongpass')

    with pytest.raises(ValueError, match='User with this email already exists'):
        register_user(email='dup@example.com', password='anotherpass')

    assert User.objects.filter(email='dup@example.com').count() == 1


@pytest.mark.django_db
def test_register_user_does_not_create_user_when_password_too_short():
    with pytest.raises(ValueError, match='Password must be at least 8 characters'):
        register_user(email='nope@example.com', password='short')

    assert not User.objects.filter(email='nope@example.com').exists()


# ===========================================================================
# authenticate_user
# ===========================================================================

@pytest.mark.django_db
def test_authenticate_user_returns_user_with_valid_credentials():
    User.objects.create_user(email='auth@example.com', password='validpass')

    result = authenticate_user(email='auth@example.com', password='validpass')

    assert result is not None
    assert result.email == 'auth@example.com'


@pytest.mark.django_db
def test_authenticate_user_returns_none_with_wrong_password():
    User.objects.create_user(email='wrong@example.com', password='correctpass')

    result = authenticate_user(email='wrong@example.com', password='wrongpass')

    assert result is None


@pytest.mark.django_db
def test_authenticate_user_returns_none_for_nonexistent_email():
    result = authenticate_user(email='ghost@example.com', password='anypass')

    assert result is None


@pytest.mark.django_db
def test_authenticate_user_raises_permission_error_for_disabled_account():
    user = User.objects.create_user(email='disabled@example.com', password='validpass')
    user.is_active = False
    user.save()

    with pytest.raises(PermissionError, match='Account is disabled'):
        authenticate_user(email='disabled@example.com', password='validpass')

    user.refresh_from_db()
    assert user.is_active is False


# ===========================================================================
# authenticate_google_user (no credential — email provided directly)
# ===========================================================================

@pytest.mark.django_db
def test_authenticate_google_user_creates_new_user_when_email_not_registered():
    user, created = authenticate_google_user(
        email='google@example.com',
        given_name='Bob',
        family_name='Jones',
    )

    assert created is True
    assert user.email == 'google@example.com'
    assert User.objects.filter(email='google@example.com').exists()


@pytest.mark.django_db
def test_authenticate_google_user_returns_created_true_for_new_user():
    _, created = authenticate_google_user(email='newgoogle@example.com')

    assert created is True


@pytest.mark.django_db
def test_authenticate_google_user_returns_existing_user_without_creating():
    existing = User.objects.create_user(email='existing@example.com', password=None)

    user, created = authenticate_google_user(email='existing@example.com')

    assert created is False
    assert user.pk == existing.pk
    assert User.objects.filter(email='existing@example.com').count() == 1


@pytest.mark.django_db
def test_authenticate_google_user_normalises_email_to_lowercase():
    user, _ = authenticate_google_user(email='Upper@EXAMPLE.COM')

    assert user.email == 'upper@example.com'


@pytest.mark.django_db
def test_authenticate_google_user_updates_names_for_existing_user_with_empty_names():
    """Verifies that authenticate_google_user updates first_name and last_name for a user with empty name fields."""
    existing = User.objects.create_user(
        email='noname@example.com', password=None,
        first_name='', last_name='',
    )

    user, created = authenticate_google_user(
        email='noname@example.com',
        given_name='Carlos',
        family_name='García',
    )

    existing.refresh_from_db()
    assert created is False
    assert existing.first_name == 'Carlos'
    assert existing.last_name == 'García'


@pytest.mark.django_db
def test_authenticate_google_user_preserves_existing_names():
    """Verifies that authenticate_google_user does not overwrite existing first_name and last_name."""
    existing = User.objects.create_user(
        email='named@example.com', password=None,
        first_name='Original', last_name='Name',
    )

    authenticate_google_user(
        email='named@example.com',
        given_name='Other',
        family_name='Person',
    )

    existing.refresh_from_db()
    assert existing.first_name == 'Original'
    assert existing.last_name == 'Name'


@pytest.mark.django_db
def test_authenticate_google_user_raises_when_no_email_provided():
    count_before = User.objects.count()

    with pytest.raises(ValueError, match='Email is required'):
        authenticate_google_user(email='', given_name='Bob')

    assert User.objects.count() == count_before


# ===========================================================================
# authenticate_google_user (with credential — external boundary mocked)
# ===========================================================================

@pytest.mark.django_db
def test_authenticate_google_user_resolves_email_from_valid_credential():
    """Verifies that authenticate_google_user resolves the email from a valid Google credential token."""
    fake_payload = {
        'email': 'fromtoken@example.com',
        'given_name': 'Token',
        'family_name': 'User',
    }

    with patch(
        'base_feature_app.services.auth_service._resolve_google_payload',
        return_value=fake_payload,
    ):
        user, created = authenticate_google_user(credential='fake-token-string')

    assert created is True
    assert user.email == 'fromtoken@example.com'


@pytest.mark.django_db
def test_authenticate_google_user_raises_when_credential_is_invalid():
    count_before = User.objects.count()

    with patch(
        'base_feature_app.services.auth_service._resolve_google_payload',
        side_effect=ValueError('Google token validation failed'),
    ):
        with pytest.raises(ValueError, match='Google token validation failed'):
            authenticate_google_user(credential='bad-token')

    assert User.objects.count() == count_before
