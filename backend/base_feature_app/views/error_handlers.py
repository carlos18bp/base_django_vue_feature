from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Normalise all DRF error responses to a consistent shape.

    Wraps detail-only payloads under {'error': ...} so every error
    response the API returns follows the same structure:

        {'error': '<message>'}                   # simple errors
        {'error': '<message>', 'details': {...}} # validation errors (set by views)

    Non-DRF exceptions (e.g. unhandled Python errors) are passed through
    to Django's default 500 handler and return None here.

    Args:
        exc: The exception that was raised.
        context: Dict with 'view' and 'request' keys from DRF.

    Returns:
        Response with normalised payload, or None if the exception is not
        handled by DRF.
    """
    response = exception_handler(exc, context)

    if response is not None and isinstance(response.data, dict):
        if 'detail' in response.data and len(response.data) == 1:
            response.data = {'error': str(response.data['detail'])}

    return response
