import importlib.util
import json
import sys
from pathlib import Path


RUNNER_PATH = Path(__file__).resolve().parents[4] / "scripts" / "run-tests-all-suites.py"


class FakeProcess:
    def __init__(self, lines):
        self.stdout = lines

    def wait(self):
        return 0


def load_runner_module():
    spec = importlib.util.spec_from_file_location("run_tests_all_suites", RUNNER_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules.pop(spec.name, None)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_main_defaults_to_sequential_verbose(tmp_path, monkeypatch):
    """Verify main() runs all three suites sequentially with quiet=False and append_log=False by default."""
    runner = load_runner_module()
    calls = []

    def make_runner(name):
        def _run(**kwargs):
            calls.append((name, kwargs["quiet"], kwargs["append_log"]))
            return runner.StepResult(
                name=name,
                command=[name],
                returncode=0,
                duration=0.0,
                status="ok",
            )

        return _run

    monkeypatch.setattr(runner, "run_backend", make_runner("backend"))
    monkeypatch.setattr(runner, "run_frontend_unit", make_runner("frontend-unit"))
    monkeypatch.setattr(runner, "run_frontend_e2e", make_runner("frontend-e2e"))
    monkeypatch.setattr(sys, "argv", ["runner", f"--report-dir={tmp_path}"])

    exit_code = runner.main()

    assert exit_code == 0
    assert calls == [
        ("backend", False, False),
        ("frontend-unit", False, False),
        ("frontend-e2e", False, False),
    ]


def test_resume_runs_failed_suites_only(tmp_path, monkeypatch):
    """Verify --resume skips suites that passed previously and only re-runs suites with non-ok status."""
    runner = load_runner_module()
    report_dir = tmp_path / "reports"
    report_dir.mkdir()
    resume_path = report_dir / runner.RESUME_FILENAME
    resume_payload = {
        "run_id": "prev",
        "generated_at": "2026-02-24T18:00:00Z",
        "suites": [
            {"name": "backend", "status": "ok", "returncode": 0},
            {"name": "frontend-unit", "status": "failed", "returncode": 1},
            {"name": "frontend-e2e", "returncode": 1},
        ],
    }
    resume_path.write_text(json.dumps(resume_payload), encoding="utf-8")

    calls = []

    def make_runner(name):
        def _run(**_kwargs):
            calls.append(name)
            return runner.StepResult(
                name=name,
                command=[name],
                returncode=0,
                duration=0.0,
                status="ok",
            )

        return _run

    monkeypatch.setattr(runner, "run_backend", make_runner("backend"))
    monkeypatch.setattr(runner, "run_frontend_unit", make_runner("frontend-unit"))
    monkeypatch.setattr(runner, "run_frontend_e2e", make_runner("frontend-e2e"))
    monkeypatch.setattr(sys, "argv", ["runner", f"--report-dir={report_dir}", "--resume"])

    exit_code = runner.main()

    assert exit_code == 0
    assert calls == ["frontend-unit", "frontend-e2e"]

    summary = json.loads(resume_path.read_text(encoding="utf-8"))
    assert summary["suites"][0]["name"] == "backend"
    assert summary["suites"][1]["name"] == "frontend-unit"
    assert summary["suites"][2]["name"] == "frontend-e2e"


def test_resume_exits_when_previous_run_ok(tmp_path, monkeypatch, capsys):
    """Verify --resume prints a re-run message and exits 0 without running any suite when all suites passed."""
    runner = load_runner_module()
    report_dir = tmp_path / "reports"
    report_dir.mkdir()
    resume_path = report_dir / runner.RESUME_FILENAME
    resume_payload = {
        "run_id": "prev",
        "generated_at": "2026-02-24T18:00:00Z",
        "suites": [
            {"name": "backend", "status": "ok", "returncode": 0},
            {"name": "frontend-unit", "status": "ok", "returncode": 0},
            {"name": "frontend-e2e", "status": "ok", "returncode": 0},
        ],
    }
    resume_path.write_text(json.dumps(resume_payload), encoding="utf-8")

    def fail_runner(**_kwargs):
        raise AssertionError("Runner should not execute")

    monkeypatch.setattr(runner, "run_backend", fail_runner)
    monkeypatch.setattr(runner, "run_frontend_unit", fail_runner)
    monkeypatch.setattr(runner, "run_frontend_e2e", fail_runner)
    monkeypatch.setattr(sys, "argv", ["runner", f"--report-dir={report_dir}", "--resume"])

    exit_code = runner.main()
    output = capsys.readouterr().out

    assert exit_code == 0
    assert "Re-run without --resume" in output


def test_resume_runs_all_suites_when_summary_invalid(tmp_path, monkeypatch):
    """Verify --resume falls back to running all suites when the existing summary file contains invalid JSON."""
    runner = load_runner_module()
    report_dir = tmp_path / "reports"
    report_dir.mkdir()
    resume_path = report_dir / runner.RESUME_FILENAME
    resume_path.write_text("not-json", encoding="utf-8")

    calls = []

    def make_runner(name):
        def _run(**_kwargs):
            calls.append(name)
            return runner.StepResult(
                name=name,
                command=[name],
                returncode=0,
                duration=0.0,
                status="ok",
            )

        return _run

    monkeypatch.setattr(runner, "run_backend", make_runner("backend"))
    monkeypatch.setattr(runner, "run_frontend_unit", make_runner("frontend-unit"))
    monkeypatch.setattr(runner, "run_frontend_e2e", make_runner("frontend-e2e"))
    monkeypatch.setattr(sys, "argv", ["runner", f"--report-dir={report_dir}", "--resume"])

    exit_code = runner.main()

    assert exit_code == 0
    assert calls == ["backend", "frontend-unit", "frontend-e2e"]


def test_run_command_overwrites_log_by_default(tmp_path, monkeypatch):
    """Verify run_command overwrites any pre-existing log file content when append_log=False."""
    runner = load_runner_module()
    log_path = tmp_path / "suite.log"
    log_path.write_text("OLD\n", encoding="utf-8")

    def fake_popen(*_args, **_kwargs):
        return FakeProcess(["line-1\n"])

    monkeypatch.setattr(runner.subprocess, "Popen", fake_popen)

    result = runner.run_command(
        name="backend",
        command=["pytest"],
        cwd=tmp_path,
        log_path=log_path,
        capture_coverage=False,
        append_log=False,
        quiet=True,
    )

    content = log_path.read_text(encoding="utf-8")
    assert "OLD" not in content
    assert "line-1" in content
    assert result.status == "ok"


def test_run_command_appends_log_header(tmp_path, monkeypatch):
    """Verify run_command appends a header and new output after existing log content when append_log=True."""
    runner = load_runner_module()
    log_path = tmp_path / "suite.log"
    log_path.write_text("OLD\n", encoding="utf-8")

    def fake_popen(*_args, **_kwargs):
        return FakeProcess(["line-2\n"])

    monkeypatch.setattr(runner.subprocess, "Popen", fake_popen)

    result = runner.run_command(
        name="backend",
        command=["pytest"],
        cwd=tmp_path,
        log_path=log_path,
        capture_coverage=False,
        append_log=True,
        log_header="HEADER",
        quiet=True,
    )

    content = log_path.read_text(encoding="utf-8")
    assert content.startswith("OLD")
    assert "HEADER" in content
    assert "line-2" in content
    assert content.index("OLD") < content.index("HEADER") < content.index("line-2")
    assert result.status == "ok"
