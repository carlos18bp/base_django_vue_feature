"""
Production settings for base_feature_project.

Overrides: DEBUG=False, MySQL database, SMTP email.
Usage: DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod
"""

from .settings import BASE_DIR, get_env  # noqa: F401
from .settings import *  # noqa: F401, F403

DEBUG = False

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

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
