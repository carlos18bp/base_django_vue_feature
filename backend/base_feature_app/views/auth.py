from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from base_feature_app.services.auth_service import (
    authenticate_google_user,
    authenticate_user,
    register_user,
)


def _token_response(user) -> dict:
    """
    Build token payload dict for a given user.

    :param user: Authenticated User instance.
    :returns: Dict with user info and JWT tokens.
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


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    """
    Register a new user with email and password.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = register_user(
            email=email,
            password=password,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
        )
        return Response(_token_response(user), status=status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in(request):
    """
    Sign in user with email and password.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = authenticate_user(email=email, password=password)
    except PermissionError as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response(_token_response(user), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """
    Authenticate or register user with Google OAuth.
    """
    credential = request.data.get('credential') or request.data.get('id_token')
    email = (request.data.get('email') or '').strip().lower()
    given_name = (request.data.get('given_name') or '').strip()
    family_name = (request.data.get('family_name') or '').strip()

    try:
        user, created = authenticate_google_user(
            credential=credential or '',
            email=email,
            given_name=given_name,
            family_name=family_name,
        )
    except ValueError as e:
        error_msg = str(e)
        if 'Email is required' in error_msg:
            return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Google token validation failed'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    payload = _token_response(user)
    payload['created'] = created
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['GET'])
def validate_token(request):
    """
    Validate if the current token is valid.
    """
    if request.user.is_authenticated:
        return Response({
            'valid': True,
            'user': {
                'id': request.user.id,
                'email': request.user.email,
            }
        }, status=status.HTTP_200_OK)

    return Response({'valid': False}, status=status.HTTP_401_UNAUTHORIZED)
