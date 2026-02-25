"""Management command to run the email configuration smoke-test."""

import importlib.util
from pathlib import Path

from django.core.management.base import BaseCommand

EMAIL_TEST_PATH = Path(__file__).resolve().parents[3] / "scripts" / "email_test.py"


def load_email_test_module():
    spec = importlib.util.spec_from_file_location("email_test", EMAIL_TEST_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Command(BaseCommand):
    help = "Send a single test email using the configured EMAIL_* settings."

    def handle(self, *args, **options):
        email_test = load_email_test_module()
        email_test.run_email_test()
