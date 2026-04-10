"""
Authentication utility functions.
"""
from rest_framework_simplejwt.tokens import RefreshToken


def generate_auth_tokens(user):
    """
    Generate JWT tokens for a user.

    :param user: User instance
    :return: Dictionary with user info and JWT tokens.
    """
    refresh = RefreshToken.for_user(user)

    return {
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        },
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }
