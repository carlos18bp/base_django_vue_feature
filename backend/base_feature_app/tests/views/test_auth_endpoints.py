import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
def test_sign_up_requires_email_and_password(api_client):
    url = reverse('sign_up')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_sign_up_rejects_short_password(api_client):
    url = reverse('sign_up')
    response = api_client.post(
        url,
        {'email': 'short@example.com', 'password': '123'},
        format='json',
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_sign_up_rejects_existing_email(api_client):
    User = get_user_model()
    User.objects.create_user(email='exists@example.com', password='pass12345')

    url = reverse('sign_up')
    response = api_client.post(
        url,
        {'email': 'exists@example.com', 'password': 'pass12345'},
        format='json',
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_sign_up_success(api_client):
    """Verifies that a valid sign_up request creates a user and returns access and refresh tokens."""
    url = reverse('sign_up')
    response = api_client.post(
        url,
        {
            'email': 'new@example.com',
            'password': 'pass12345',
            'first_name': 'New',
            'last_name': 'User',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data['user']['email'] == 'new@example.com'
    assert 'access' in data
    assert 'refresh' in data


@pytest.mark.django_db
def test_sign_up_returns_exception_message(api_client, monkeypatch):
    """Verifies that sign_up returns HTTP 400 when user creation raises an unexpected exception."""
    from base_feature_app.models import User

    def boom(*args, **kwargs):
        raise Exception('boom')

    monkeypatch.setattr(User.objects, 'create_user', boom)

    url = reverse('sign_up')
    response = api_client.post(
        url,
        {'email': 'err@example.com', 'password': 'pass12345'},
        format='json',
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_sign_in_requires_email_and_password(api_client):
    url = reverse('sign_in')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_sign_in_invalid_credentials(api_client):
    url = reverse('sign_in')
    response = api_client.post(
        url,
        {'email': 'missing@example.com', 'password': 'pass12345'},
        format='json',
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_sign_in_disabled_account(api_client):
    User = get_user_model()
    user = User.objects.create_user(email='disabled@example.com', password='pass12345')
    user.is_active = False
    user.save(update_fields=['is_active'])

    url = reverse('sign_in')
    response = api_client.post(
        url,
        {'email': 'disabled@example.com', 'password': 'pass12345'},
        format='json',
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_sign_in_success(api_client):
    """Verifies that valid credentials return HTTP 200 with user info and JWT tokens."""
    User = get_user_model()
    User.objects.create_user(email='login@example.com', password='pass12345')

    url = reverse('sign_in')
    response = api_client.post(
        url,
        {'email': 'login@example.com', 'password': 'pass12345'},
        format='json',
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['user']['email'] == 'login@example.com'
    assert 'access' in data
    assert 'refresh' in data


@pytest.mark.django_db
def test_validate_token_unauthenticated(api_client):
    url = reverse('validate_token')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_validate_token_authenticated(api_client):
    User = get_user_model()
    user = User.objects.create_user(email='val@example.com', password='pass12345')

    api_client.force_authenticate(user=user)
    url = reverse('validate_token')
    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['valid'] is True
    assert data['user']['email'] == 'val@example.com'


@pytest.mark.django_db
def test_google_login_requires_email_when_no_credential(api_client):
    url = reverse('google_login')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_google_login_creates_user_without_credential(api_client):
    url = reverse('google_login')
    response = api_client.post(
        url,
        {'email': 'google@example.com', 'given_name': 'G', 'family_name': 'User'},
        format='json',
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['user']['email'] == 'google@example.com'
    assert data['created'] is True


@pytest.mark.django_db
def test_google_login_updates_existing_user_names(api_client):
    """Verifies that google_login updates first_name and last_name for an existing user with empty names."""
    User = get_user_model()
    user = User.objects.create_user(email='update@example.com', password='pass12345', first_name='', last_name='')

    url = reverse('google_login')
    response = api_client.post(
        url,
        {'email': 'update@example.com', 'given_name': 'Given', 'family_name': 'Family'},
        format='json',
    )
    assert response.status_code == status.HTTP_200_OK

    user.refresh_from_db()
    assert user.first_name == 'Given'
    assert user.last_name == 'Family'


@pytest.mark.django_db
def test_google_login_with_credential_and_client_id(api_client, settings, monkeypatch):
    """Verifies that google_login authenticates a user when a valid credential is verified against the configured client ID."""
    # quality: disable global_state_mutation (pytest-django settings fixture auto-reverts after test)
    settings.GOOGLE_OAUTH_CLIENT_ID = 'client-id'

    def fake_verify(credential, request, audience):
        assert audience == 'client-id'
        return {
            'email': 'payload@example.com',
            'given_name': 'Payload',
            'family_name': 'User',
            'picture': 'http://example.com/p.png',
        }

    monkeypatch.setattr('base_feature_app.services.auth_service.id_token.verify_oauth2_token', fake_verify)

    url = reverse('google_login')
    response = api_client.post(
        url,
        {'credential': 'x'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['user']['email'] == 'payload@example.com'


@pytest.mark.django_db
def test_google_login_credential_tokeninfo_invalid(api_client, settings, monkeypatch):
    """Verifies that google_login returns HTTP 401 when the tokeninfo endpoint returns a non-200 status."""
    # quality: disable global_state_mutation (pytest-django settings fixture auto-reverts after test)
    settings.GOOGLE_OAUTH_CLIENT_ID = ''

    class FakeResp:
        status_code = 400

        def json(self):
            return {}

    monkeypatch.setattr('base_feature_app.services.auth_service.http_requests.get', lambda *args, **kwargs: FakeResp())

    url = reverse('google_login')
    response = api_client.post(url, {'credential': 'x'}, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_google_login_create_user_exception(api_client, monkeypatch):
    """Verifies that google_login returns HTTP 400 when user lookup raises an unexpected exception."""
    from base_feature_app.models import User

    def boom(*args, **kwargs):
        raise Exception('boom')

    monkeypatch.setattr(User.objects, 'filter', boom)

    url = reverse('google_login')
    response = api_client.post(
        url,
        {'email': 'fail@example.com', 'given_name': 'X', 'family_name': 'Y'},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_google_login_credential_tokeninfo_success(api_client, settings, monkeypatch):
    """Verifies that google_login creates a user when the tokeninfo endpoint returns valid user info."""
    # quality: disable global_state_mutation (pytest-django settings fixture auto-reverts after test)
    settings.GOOGLE_OAUTH_CLIENT_ID = ''

    class FakeResp:
        status_code = 200

        def json(self):
            return {
                'email': 'tokeninfo@example.com',
                'given_name': 'Token',
                'family_name': 'Info',
                'picture': 'http://example.com/p.png',
            }

    monkeypatch.setattr('base_feature_app.services.auth_service.http_requests.get', lambda *args, **kwargs: FakeResp())

    url = reverse('google_login')
    response = api_client.post(url, {'credential': 'x'}, format='json')

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['user']['email'] == 'tokeninfo@example.com'
    assert data['created'] is True


@pytest.mark.django_db
def test_validate_token_returns_valid_false_for_anonymous_user(api_client, monkeypatch):
    from rest_framework.permissions import AllowAny
    from base_feature_app.views.auth import validate_token

    monkeypatch.setattr(validate_token.cls, 'permission_classes', [AllowAny])

    url = reverse('validate_token')
    response = api_client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'valid': False}


@pytest.mark.django_db
def test_google_login_credential_verification_exception(api_client, settings, monkeypatch):
    # quality: disable global_state_mutation (pytest-django settings fixture auto-reverts after test)
    settings.GOOGLE_OAUTH_CLIENT_ID = 'client-id'

    def boom(*args, **kwargs):
        raise Exception('bad')

    monkeypatch.setattr('base_feature_app.services.auth_service.id_token.verify_oauth2_token', boom)

    url = reverse('google_login')
    response = api_client.post(url, {'credential': 'x'}, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
