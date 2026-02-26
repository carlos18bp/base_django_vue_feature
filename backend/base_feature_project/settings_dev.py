"""
Development settings for base_feature_project.

Overrides: DEBUG=True, SQLite database, console email backend.
Usage: DJANGO_SETTINGS_MODULE=base_feature_project.settings_dev
"""

from .settings import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
