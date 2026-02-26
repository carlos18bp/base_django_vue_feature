import importlib
import os
import sys

import pytest
from django.core.exceptions import ImproperlyConfigured


def _reload_settings_module(module_name: str):
    sys.modules.pop('base_feature_project.settings', None)
    sys.modules.pop(module_name, None)
    return importlib.import_module(module_name)


def _reload_module(module_name: str):
    sys.modules.pop(module_name, None)
    return importlib.import_module(module_name)


def _set_required_prod_db_env(monkeypatch):
    monkeypatch.setenv('DB_NAME', 'prod_db')
    monkeypatch.setenv('DB_USER', 'prod_user')
    monkeypatch.setenv('DB_PASSWORD', 'prod_password')
    monkeypatch.setenv('DJANGO_SECRET_KEY', 'test-secret-key-for-prod')
    monkeypatch.setenv('DJANGO_ALLOWED_HOSTS', 'example.com')


def test_settings_dev_sets_debug_true(monkeypatch):
    monkeypatch.setenv('DJANGO_DEBUG', 'false')

    module = _reload_settings_module('base_feature_project.settings_dev')

    assert module.DEBUG is True


def test_settings_dev_uses_sqlite_engine(monkeypatch):
    monkeypatch.setenv('DJANGO_DB_ENGINE', 'django.db.backends.postgresql')

    module = _reload_settings_module('base_feature_project.settings_dev')

    assert module.DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3'


def test_settings_dev_uses_console_email_backend(monkeypatch):
    monkeypatch.setenv(
        'DJANGO_EMAIL_BACKEND',
        'django.core.mail.backends.smtp.EmailBackend',
    )

    module = _reload_settings_module('base_feature_project.settings_dev')

    assert module.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend'


def test_settings_prod_sets_debug_false(monkeypatch):
    monkeypatch.setenv('DJANGO_DEBUG', 'true')
    _set_required_prod_db_env(monkeypatch)

    module = _reload_settings_module('base_feature_project.settings_prod')

    assert module.DEBUG is False


def test_settings_prod_uses_mysql_engine(monkeypatch):
    monkeypatch.setenv('DJANGO_DB_ENGINE', 'django.db.backends.sqlite3')
    _set_required_prod_db_env(monkeypatch)

    module = _reload_settings_module('base_feature_project.settings_prod')

    assert module.DATABASES['default']['ENGINE'] == 'django.db.backends.mysql'


def test_settings_prod_uses_smtp_email_backend(monkeypatch):
    monkeypatch.setenv(
        'DJANGO_EMAIL_BACKEND',
        'django.core.mail.backends.console.EmailBackend',
    )
    _set_required_prod_db_env(monkeypatch)

    module = _reload_settings_module('base_feature_project.settings_prod')

    assert module.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend'


def test_settings_get_env_raises_when_required_missing(monkeypatch):
    monkeypatch.delenv('MISSING_SETTINGS_TEST_VAR', raising=False)

    module = _reload_settings_module('base_feature_project.settings')

    with pytest.raises(ImproperlyConfigured, match='MISSING_SETTINGS_TEST_VAR'):
        module.get_env('MISSING_SETTINGS_TEST_VAR', required=True)


def test_get_bool_env_returns_true_for_truthy_values(monkeypatch):
    module = _reload_settings_module('base_feature_project.settings')

    for truthy in ('1', 'true', 'True', 'yes', 'on', 'YES', 'ON'):
        monkeypatch.setenv('TEST_BOOL', truthy)
        assert module.get_bool_env('TEST_BOOL') is True


def test_get_bool_env_returns_false_for_falsy_values(monkeypatch):
    module = _reload_settings_module('base_feature_project.settings')

    for falsy in ('0', 'false', 'no', 'off', 'anything'):
        monkeypatch.setenv('TEST_BOOL', falsy)
        assert module.get_bool_env('TEST_BOOL') is False


def test_get_bool_env_returns_default_when_missing(monkeypatch):
    monkeypatch.delenv('TEST_BOOL_MISSING', raising=False)
    module = _reload_settings_module('base_feature_project.settings')

    assert module.get_bool_env('TEST_BOOL_MISSING') is False
    assert module.get_bool_env('TEST_BOOL_MISSING', default=True) is True


def test_get_list_env_splits_comma_separated(monkeypatch):
    monkeypatch.setenv('TEST_LIST', 'a, b , c')
    module = _reload_settings_module('base_feature_project.settings')

    assert module.get_list_env('TEST_LIST') == ['a', 'b', 'c']


def test_get_list_env_returns_default_when_missing(monkeypatch):
    monkeypatch.delenv('TEST_LIST_MISSING', raising=False)
    module = _reload_settings_module('base_feature_project.settings')

    assert module.get_list_env('TEST_LIST_MISSING') == []
    assert module.get_list_env('TEST_LIST_MISSING', default=['x']) == ['x']


def test_get_list_env_returns_empty_for_empty_string(monkeypatch):
    monkeypatch.setenv('TEST_LIST_EMPTY', '')
    module = _reload_settings_module('base_feature_project.settings')

    assert module.get_list_env('TEST_LIST_EMPTY') == []


def test_settings_django_env_defaults_to_development(monkeypatch):
    monkeypatch.delenv('DJANGO_ENV', raising=False)

    module = _reload_settings_module('base_feature_project.settings')

    assert module.DJANGO_ENV == 'development'
    assert module.IS_PRODUCTION is False


def test_settings_django_env_production(monkeypatch):
    monkeypatch.setenv('DJANGO_ENV', 'production')

    module = _reload_settings_module('base_feature_project.settings')

    assert module.DJANGO_ENV == 'production'
    assert module.IS_PRODUCTION is True


def test_settings_prod_requires_secret_key(monkeypatch):
    _set_required_prod_db_env(monkeypatch)
    monkeypatch.delenv('DJANGO_SECRET_KEY', raising=False)

    with pytest.raises(ValueError, match='DJANGO_SECRET_KEY is required'):
        _reload_settings_module('base_feature_project.settings_prod')


def test_settings_prod_requires_allowed_hosts(monkeypatch):
    _set_required_prod_db_env(monkeypatch)
    monkeypatch.delenv('DJANGO_ALLOWED_HOSTS', raising=False)

    with pytest.raises(ValueError, match='DJANGO_ALLOWED_HOSTS is required'):
        _reload_settings_module('base_feature_project.settings_prod')


def test_settings_prod_enables_security_headers(monkeypatch):
    _set_required_prod_db_env(monkeypatch)

    module = _reload_settings_module('base_feature_project.settings_prod')

    assert module.SECURE_SSL_REDIRECT is True
    assert module.SESSION_COOKIE_SECURE is True
    assert module.CSRF_COOKIE_SECURE is True
    assert module.SECURE_HSTS_SECONDS == 31536000
    assert module.SECURE_HSTS_INCLUDE_SUBDOMAINS is True
    assert module.SECURE_HSTS_PRELOAD is True


def test_settings_dev_sets_allowed_hosts_wildcard(monkeypatch):
    module = _reload_settings_module('base_feature_project.settings_dev')

    assert '*' in module.ALLOWED_HOSTS


def test_asgi_defaults_to_settings_prod_when_env_missing(monkeypatch):
    monkeypatch.delenv('DJANGO_SETTINGS_MODULE', raising=False)
    _set_required_prod_db_env(monkeypatch)
    sentinel_app = object()
    monkeypatch.setattr('django.core.asgi.get_asgi_application', lambda: sentinel_app)

    module = _reload_module('base_feature_project.asgi')

    assert os.environ['DJANGO_SETTINGS_MODULE'] == 'base_feature_project.settings_prod'
    assert module.application is sentinel_app

    monkeypatch.delenv('DJANGO_SETTINGS_MODULE', raising=False)


def test_wsgi_defaults_to_settings_prod_when_env_missing(monkeypatch):
    monkeypatch.delenv('DJANGO_SETTINGS_MODULE', raising=False)
    _set_required_prod_db_env(monkeypatch)
    sentinel_app = object()
    monkeypatch.setattr('django.core.wsgi.get_wsgi_application', lambda: sentinel_app)

    module = _reload_module('base_feature_project.wsgi')

    assert os.environ['DJANGO_SETTINGS_MODULE'] == 'base_feature_project.settings_prod'
    assert module.application is sentinel_app

    monkeypatch.delenv('DJANGO_SETTINGS_MODULE', raising=False)
