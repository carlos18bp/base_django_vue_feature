# quality: disable misplaced_file (URL integration tests — no domain subdirectory applies)
import importlib
import importlib.util
from pathlib import Path


def test_import_base_feature_app_urls_as_django_module():
    module = importlib.import_module("base_feature_app.urls")

    assert hasattr(module, "urlpatterns")
    assert len(module.urlpatterns) > 0


def test_import_base_feature_app_urls_package_module():
    urls_path = Path(__file__).resolve().parents[2] / "urls" / "__init__.py"
    spec = importlib.util.spec_from_file_location("base_feature_app.urls_package", urls_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)

    assert hasattr(module, "urlpatterns")
