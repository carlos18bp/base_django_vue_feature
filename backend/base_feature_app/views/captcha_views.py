"""Views for Google reCAPTCHA integration.

Provides endpoints to fetch the reCAPTCHA site key and verify captcha tokens.
"""

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'


@api_view(['GET'])
@permission_classes([AllowAny])
def get_site_key(request):
    """Return the Google reCAPTCHA site key for frontend integration.

    Returns:
        Response: JSON with site_key field.
    """
    site_key = getattr(settings, 'RECAPTCHA_SITE_KEY', '')
    return Response({'site_key': site_key})


def verify_recaptcha(token: str) -> bool:
    """Verify a reCAPTCHA token with Google's API.

    Args:
        token: The reCAPTCHA response token from the frontend.

    Returns:
        bool: True if verification succeeds, False otherwise.
    """
    secret_key = getattr(settings, 'RECAPTCHA_SECRET_KEY', '')
    if not secret_key:
        return True

    if not token:
        return False

    try:
        response = requests.post(
            RECAPTCHA_VERIFY_URL,
            data={
                'secret': secret_key,
                'response': token,
            },
            timeout=5,
        )
        result = response.json()
        return result.get('success', False)
    except requests.RequestException:
        return False


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_captcha(request):
    """Verify a reCAPTCHA token.

    Request body:
        {"token": "reCAPTCHA-response-token"}

    Returns:
        Response: JSON with success field.
    """
    token = request.data.get('token', '')
    success = verify_recaptcha(token)

    if success:
        return Response({'success': True})
    return Response(
        {'success': False, 'detail': 'reCAPTCHA verification failed.'},
        status=status.HTTP_400_BAD_REQUEST,
    )
