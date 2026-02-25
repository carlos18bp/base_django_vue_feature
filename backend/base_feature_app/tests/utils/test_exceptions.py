import pytest
from rest_framework import status

from base_feature_app.exceptions import (
    BusinessRuleViolationException,
    PermissionDeniedException,
    ResourceNotFoundException,
)


def test_resource_not_found_exception_has_correct_status_code():
    exc = ResourceNotFoundException()

    assert exc.status_code == status.HTTP_404_NOT_FOUND
    assert exc.default_detail == 'Resource not found.'
    assert exc.default_code == 'not_found'


def test_business_rule_violation_exception_has_correct_status_code():
    exc = BusinessRuleViolationException()

    assert exc.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert exc.default_detail == 'Business rule violation.'
    assert exc.default_code == 'business_rule_violation'


def test_permission_denied_exception_has_correct_status_code():
    exc = PermissionDeniedException()

    assert exc.status_code == status.HTTP_403_FORBIDDEN
    assert exc.default_detail == 'You do not have permission to perform this action.'
    assert exc.default_code == 'permission_denied'
