import builtins
import importlib.util
import sys
from pathlib import Path

from django.conf import settings

EMAIL_TEST_PATH = Path(__file__).resolve().parents[3] / "scripts" / "email_test.py"


def load_email_test_module():
    spec = importlib.util.spec_from_file_location("email_test", EMAIL_TEST_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_email_test_adds_backend_root_to_sys_path():
    email_test = load_email_test_module()

    assert str(email_test.BACKEND_ROOT) in sys.path


def test_run_email_test_sends_email_successfully(monkeypatch, capsys):
    """Verify run_email_test sends mail with correct args and prints success."""
    email_test = load_email_test_module()
    captured = {}

    def fake_send_mail(subject, message, from_email, recipient_list, fail_silently):
        captured["subject"] = subject
        captured["message"] = message
        captured["from_email"] = from_email
        captured["recipient_list"] = recipient_list
        captured["fail_silently"] = fail_silently
        return 1

    monkeypatch.setattr(email_test, "send_mail", fake_send_mail)
    monkeypatch.setattr(builtins, "input", lambda _: "dest@example.com")

    email_test.run_email_test()

    output = capsys.readouterr().out
    assert captured["subject"] == "Test Email from Django"
    assert captured["from_email"] == settings.EMAIL_HOST_USER
    assert captured["recipient_list"] == ["dest@example.com"]
    assert captured["fail_silently"] is False
    assert "SUCCESS! Email sent successfully!" in output


def test_run_email_test_exits_without_destination_email(monkeypatch, capsys):
    email_test = load_email_test_module()

    def fail_send_mail(*_args, **_kwargs):
        raise AssertionError("send_mail should not be called")

    monkeypatch.setattr(email_test, "send_mail", fail_send_mail)
    monkeypatch.setattr(builtins, "input", lambda _: "   ")

    email_test.run_email_test()

    output = capsys.readouterr().out
    assert "No email address provided" in output


def test_run_email_test_reports_send_mail_error(monkeypatch, capsys):
    email_test = load_email_test_module()

    def fake_send_mail(*_args, **_kwargs):
        raise Exception("smtp failure")

    monkeypatch.setattr(email_test, "send_mail", fake_send_mail)
    monkeypatch.setattr(builtins, "input", lambda _: "dest@example.com")

    email_test.run_email_test()

    output = capsys.readouterr().out
    assert "ERROR: Failed to send email" in output
    assert "smtp failure" in output
