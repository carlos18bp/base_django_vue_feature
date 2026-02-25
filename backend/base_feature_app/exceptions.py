from rest_framework import status
from rest_framework.exceptions import APIException


class ResourceNotFoundException(APIException):
    """
    Raised when a requested resource does not exist.

    Maps to HTTP 404. Use instead of a bare Response(..., 404) so that
    the global exception handler can normalise the payload automatically.
    """

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found.'
    default_code = 'not_found'


class BusinessRuleViolationException(APIException):
    """
    Raised when an operation violates a business rule.

    Maps to HTTP 422 Unprocessable Entity. Use for domain-level failures
    that are not simple validation errors (e.g. empty cart at checkout).
    """

    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = 'Business rule violation.'
    default_code = 'business_rule_violation'


class PermissionDeniedException(APIException):
    """
    Raised when an authenticated user lacks the required role or ownership.

    Maps to HTTP 403 Forbidden.
    """

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to perform this action.'
    default_code = 'permission_denied'
