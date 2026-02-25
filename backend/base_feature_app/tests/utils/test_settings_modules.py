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
