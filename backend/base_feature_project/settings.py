"""
Django base settings for base_feature_project.

This file contains shared configuration for all environments.
Do NOT use this file directly — import it via settings_dev.py or settings_prod.py.

Environment-specific overrides:
  - settings_dev.py  : SQLite, DEBUG=True, console email
  - settings_prod.py : MySQL, DEBUG=False, SMTP email
"""

import os
from datetime import timedelta
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv
from huey import RedisHuey

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')


def get_env(var_name, default=None, required=False):
    """
    Retrieve an environment variable or raise if required and missing.

    Args:
        var_name: Name of the environment variable.
        default: Fallback value when the variable is not set.
        required: If True, raises ImproperlyConfigured when missing.

    Returns:
        The value of the environment variable or the default.

    Raises:
        ImproperlyConfigured: If required=True and the variable is not set.
    """
    value = os.getenv(var_name, default)
    if required and value is None:
        raise ImproperlyConfigured(f"Missing required environment variable: {var_name}")
    return value


def get_bool_env(var_name, default=False):
    """
    Retrieve an environment variable as a boolean.

    Truthy values: '1', 'true', 'yes', 'on' (case-insensitive).
    """
    value = os.getenv(var_name)
    if value is None:
        return default
    return value.lower() in {'1', 'true', 'yes', 'on'}


def get_list_env(var_name, default=None, separator=','):
    """
    Retrieve an environment variable as a list of stripped strings.

    Returns the default (or empty list) when the variable is not set or empty.
    """
    value = os.getenv(var_name)
    if not value:
        return default if default is not None else []
    return [item.strip() for item in value.split(separator) if item.strip()]


DJANGO_ENV = get_env('DJANGO_ENV', 'development')
IS_PRODUCTION = DJANGO_ENV == 'production'


SECRET_KEY = get_env('DJANGO_SECRET_KEY', 'change-me')
DEBUG = get_env('DJANGO_DEBUG', 'true').lower() in {'1', 'true', 'yes', 'on'}
ALLOWED_HOSTS = [h.strip() for h in get_env('DJANGO_ALLOWED_HOSTS', '').split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party (required)
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Third-party (optional — media-heavy profile)
    'easy_thumbnails',
    'django_attachments',
    'django_cleanup.apps.CleanupConfig',
    # Third-party (operations)
    'dbbackup',
    'huey.contrib.djhuey',
    # Project apps
    'base_feature_app',
]

ENABLE_SILK = get_bool_env('ENABLE_SILK', default=False)
if ENABLE_SILK:
    INSTALLED_APPS.append('silk')

AUTH_USER_MODEL = 'base_feature_app.User'

THUMBNAIL_ALIASES = {
    '': {
        'small': {'size': (50, 50), 'crop': True},
        'medium': {'size': (200, 200), 'crop': True},
        'large': {'size': (500, 500)},
    },
}

THUMBNAIL_DEFAULT_STORAGE = 'default'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

if ENABLE_SILK:
    MIDDLEWARE.insert(1, 'silk.middleware.SilkyMiddleware')

CORS_ALLOWED_ORIGINS = [
    o.strip() for o in get_env(
        'DJANGO_CORS_ALLOWED_ORIGINS',
        'http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:3000,http://localhost:3000',
    ).split(',') if o.strip()
]

CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in get_env(
        'DJANGO_CSRF_TRUSTED_ORIGINS',
        'http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:3000,http://localhost:3000',
    ).split(',') if o.strip()
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'accept-language',
    'authorization',
    'content-type',
    'origin',
    'x-csrftoken',
    'x-requested-with',
    'x-currency',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'base_feature_app.views.error_handlers.custom_exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        minutes=int(get_env('DJANGO_JWT_ACCESS_MINUTES', '15'))
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(
        days=int(get_env('DJANGO_JWT_REFRESH_DAYS', '7'))
    ),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

GOOGLE_OAUTH_CLIENT_ID = get_env('DJANGO_GOOGLE_OAUTH_CLIENT_ID', '')

ROOT_URLCONF = 'base_feature_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'base_feature_project.wsgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
    },
    'dbbackup': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
        'OPTIONS': {
            'location': get_env('BACKUP_STORAGE_PATH', '/var/backups/base_feature_project'),
        },
    },
}

# ==============================================================================
# EMAIL — override in settings_dev.py / settings_prod.py
# ==============================================================================

EMAIL_BACKEND = get_env('DJANGO_EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = get_env('DJANGO_EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(get_env('DJANGO_EMAIL_PORT', '587'))
EMAIL_USE_TLS = get_env('DJANGO_EMAIL_USE_TLS', 'true').lower() in {'1', 'true', 'yes', 'on'}
EMAIL_HOST_USER = get_env('DJANGO_EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = get_env('DJANGO_EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = get_env('DJANGO_DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
SERVER_EMAIL = get_env('DJANGO_SERVER_EMAIL', EMAIL_HOST_USER)

# ==============================================================================
# DATABASE — override in settings_dev.py / settings_prod.py
# ==============================================================================

DATABASES = {
    'default': {
        'ENGINE': get_env('DJANGO_DB_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': get_env('DJANGO_DB_NAME', str(BASE_DIR / 'db.sqlite3')),
    }
}

# ==============================================================================
# HUEY — task queue
# ==============================================================================

HUEY = RedisHuey(
    name='base_feature_project',
    url=get_env('REDIS_URL', 'redis://localhost:6379/1'),
    immediate=not IS_PRODUCTION,
)

# ==============================================================================
# BACKUPS — django-dbbackup
# ==============================================================================
# Storage is configured via STORAGES['dbbackup'] above (new-style API).

DBBACKUP_FILENAME_TEMPLATE = '{datetime}.sql'
DBBACKUP_MEDIA_FILENAME_TEMPLATE = '{datetime}.tar'
DBBACKUP_CLEANUP_KEEP = 5
DBBACKUP_CLEANUP_KEEP_MEDIA = 5

# ==============================================================================
# SILK — query profiling (enabled via ENABLE_SILK env flag)
# ==============================================================================

if ENABLE_SILK:
    # Headless monitoring only — no UI, no Python profiling.
    # Records SQL queries (time_taken, query count) for the weekly report task.
    SILKY_MAX_RECORDED_REQUESTS = 10000
    SILKY_MAX_RECORDED_REQUESTS_CHECK_PERCENT = 10

    SILKY_IGNORE_PATHS = [
        '/admin/',
        '/static/',
        '/media/',
    ]

    SILKY_MAX_REQUEST_BODY_SIZE = 1024
    SILKY_MAX_RESPONSE_BODY_SIZE = 1024

SLOW_QUERY_THRESHOLD_MS = int(get_env('SLOW_QUERY_THRESHOLD_MS', '500'))
N_PLUS_ONE_THRESHOLD = int(get_env('N_PLUS_ONE_THRESHOLD', '10'))

# ==============================================================================
# LOGGING
# ==============================================================================

LOG_LEVEL = get_env('DJANGO_LOG_LEVEL', 'INFO')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': LOG_LEVEL,
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'backup_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'backups.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': LOG_LEVEL,
            'propagate': True,
        },
        'backups': {
            'handlers': ['backup_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
