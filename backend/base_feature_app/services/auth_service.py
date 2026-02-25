import requests as http_requests
from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from base_feature_app.models import User


def register_user(email: str, password: str, first_name: str = '', last_name: str = '') -> User:
    """
    Create and return a new user with the given credentials.

    :param email: User email address.
    :param password: Plain-text password (will be hashed).
    :param first_name: Optional first name.
    :param last_name: Optional last name.
    :returns: Newly created User instance.
    :raises ValueError: If email already exists or password is too short.
    """
    if len(password) < 8:
        raise ValueError('Password must be at least 8 characters')

    if User.objects.filter(email=email).exists():
        raise ValueError('User with this email already exists')

    return User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )


def authenticate_user(email: str, password: str):
    """
    Verify email/password credentials and return the user if valid.

    :param email: User email address.
    :param password: Plain-text password.
    :returns: User instance if credentials are valid, None otherwise.
    :raises PermissionError: If the account is disabled.
    """
    try:
        user_check = User.objects.get(email=email)
        if not user_check.is_active:
            raise PermissionError('Account is disabled')
    except User.DoesNotExist:
        pass

    from django.contrib.auth import authenticate
    return authenticate(username=email, password=password)


def _resolve_google_payload(credential: str) -> dict:
    """
    Verify a Google credential token and return its payload.

    :param credential: Google ID token string.
    :returns: Token payload dict with email, given_name, family_name, picture.
    :raises ValueError: If the token is invalid or verification fails.
    """
    client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '')

    try:
        if client_id:
            payload = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id,
            )
        else:
            response = http_requests.get(
                'https://oauth2.googleapis.com/tokeninfo',
                params={'id_token': credential},
                timeout=5,
            )
            if response.status_code != 200:
                raise ValueError('Invalid Google credential')
            payload = response.json()
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError('Google token validation failed') from exc

    return payload


def authenticate_google_user(
    credential: str = '',
    email: str = '',
    given_name: str = '',
    family_name: str = '',
) -> tuple[User, bool]:
    """
    Authenticate or register a user via Google OAuth.

    :param credential: Google ID token (optional if email is provided directly).
    :param email: User email address (used when no credential is provided).
    :param given_name: User first name.
    :param family_name: User last name.
    :returns: Tuple of (user, created) where created is True if user was newly registered.
    :raises ValueError: If email cannot be resolved or credential is invalid.
    """
    if credential:
        payload = _resolve_google_payload(credential)
        token_email = (payload.get('email') or '').strip().lower()
        if token_email:
            email = token_email
        given_name = payload.get('given_name') or given_name
        family_name = payload.get('family_name') or family_name

    email = email.strip().lower()
    if not email:
        raise ValueError('Email is required')

    user = User.objects.filter(email=email).first()
    created = False

    if not user:
        user = User.objects.create_user(
            email=email,
            first_name=given_name,
            last_name=family_name,
            password=None,
        )
        created = True
    else:
        if given_name and not user.first_name:
            user.first_name = given_name
        if family_name and not user.last_name:
            user.last_name = family_name
        user.save()

    return user, created
