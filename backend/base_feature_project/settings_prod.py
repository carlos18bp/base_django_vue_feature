"""
Production settings for base_feature_project.

Overrides: DEBUG=False, MySQL database, SMTP email, security hardening.
Usage: DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod
"""

import os

from .settings import BASE_DIR, get_env  # noqa: F401
from .settings import *  # noqa: F401, F403

# ==============================================================================
# CORE — production overrides
# ==============================================================================

DEBUG = False  # Hardcoded, never from environment

# Required in production
if not os.getenv('DJANGO_SECRET_KEY'):
    raise ValueError("DJANGO_SECRET_KEY is required in production")
if not os.getenv('DJANGO_ALLOWED_HOSTS'):
    raise ValueError("DJANGO_ALLOWED_HOSTS is required in production")

# ==============================================================================
# SECURITY
# ==============================================================================

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# ==============================================================================
# DATABASE — MySQL
# ==============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': get_env('DB_NAME', required=True),
        'USER': get_env('DB_USER', required=True),
        'PASSWORD': get_env('DB_PASSWORD', required=True),
        'HOST': get_env('DB_HOST', 'localhost'),
        'PORT': get_env('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# ==============================================================================
# EMAIL — SMTP
# ==============================================================================

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# ==============================================================================
# LOGGING — production overrides
# ==============================================================================

LOGGING['handlers']['backup_file']['level'] = 'WARNING'  # noqa: F405
LOGGING['loggers']['django']['level'] = 'WARNING'  # noqa: F405
