import importlib.util
import json
import sys
import types
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


def test_read_backend_summary_returns_metric_lines(tmp_path, monkeypatch):
    """Verify backend summary aggregates non-test files under base_feature_app."""
    monkeypatch.setenv("NO_COLOR", "1")
    runner = load_runner_module()
    backend_root = tmp_path / "backend"
    backend_root.mkdir()
    (backend_root / ".coverage").write_text("", encoding="utf-8")

    app_dir = backend_root / "base_feature_app"
    tests_dir = app_dir / "tests"
    other_dir = backend_root / "other_app"
    app_dir.mkdir()
    tests_dir.mkdir(parents=True)
    other_dir.mkdir()

    covered_file = app_dir / "views.py"
    test_file = tests_dir / "test_views.py"
    other_file = other_dir / "views.py"
    covered_file.write_text(
        "def first():\n"
        "    return True\n"
        "\n"
        "def second():\n"
        "    return False\n",
        encoding="utf-8",
    )
    test_file.write_text("", encoding="utf-8")
    other_file.write_text("", encoding="utf-8")

    class FakeNumbers:
        def __init__(self, n_branches, n_missing_branches):
            self.n_branches = n_branches
            self.n_missing_branches = n_missing_branches

    class FakeAnalysis:
        def __init__(self, statements, missing, numbers):
            self.statements = statements
            self.missing = missing
            self.numbers = numbers

    class FakeCoverage:
        def __init__(self, analysis_map, measured_files):
            self._analysis_map = analysis_map
            self._measured_files = measured_files

        def load(self):
            return None

        def get_data(self):
            return self

        def measured_files(self):
            return self._measured_files

        def _analyze(self, filepath):
            return self._analysis_map[str(filepath)]

    analysis_map = {
        str(covered_file): FakeAnalysis(
            [1, 2, 4, 5],
            [5],
            FakeNumbers(n_branches=2, n_missing_branches=1),
        ),
    }
    measured_files = [covered_file, test_file, other_file]
    fake_module = types.SimpleNamespace(
        Coverage=lambda data_file: FakeCoverage(analysis_map, measured_files)
    )
    monkeypatch.setattr(runner, "coverage_module", fake_module)

    lines = runner.read_backend_coverage_summary(backend_root)

    assert lines == [
        "Statements: 75.00% (3/4)",
        "Branches: 50.00% (1/2)",
        "Functions: 50.00% (1/2)",
        "Lines: 75.00% (3/4)",
        "TOTAL: 62.50% (5/8)",
    ]


def test_read_flow_summary_reads_flow_counts(tmp_path, monkeypatch):
    """Verify flow summary reads totals from flow-coverage.json."""
    monkeypatch.setenv("NO_COLOR", "1")
    runner = load_runner_module()
    frontend_root = tmp_path / "frontend"
    results_dir = frontend_root / "e2e-results"
    results_dir.mkdir(parents=True)
    payload = {
        "summary": {
            "total": 5,
            "covered": 3,
            "partial": 1,
            "failing": 1,
            "missing": 0,
        }
    }
    (results_dir / "flow-coverage.json").write_text(
        json.dumps(payload), encoding="utf-8"
    )

    lines = runner.read_flow_coverage_summary(frontend_root)

    assert lines == [
        "Flows covered: 60.00% (3/5)",
        "Partial: 1",
        "Failing: 1",
    ]


def test_print_final_report_groups_metric_lines(monkeypatch, capsys):
    """Verify final report groups metric lines under a summary label."""
    monkeypatch.setenv("NO_COLOR", "1")
    runner = load_runner_module()

    result = runner.StepResult(
        name="backend",
        command=["pytest"],
        returncode=0,
        duration=1.25,
        status="ok",
        coverage=[
            "Statements: 75.00% (3/4)",
            "Branches: 50.00% (1/2)",
            "Functions: 50.00% (1/2)",
        ],
    )

    runner.print_final_report([result], duration=1.25)

    output = capsys.readouterr().out
    assert "Coverage summary:" in output
    assert "      Statements: 75.00% (3/4)" in output
    assert "      Branches: 50.00% (1/2)" in output
    assert "      Functions: 50.00% (1/2)" in output


def test_run_backend_erases_metrics_when_enabled(tmp_path, monkeypatch):
    """Verify run_backend issues a coverage erase before running pytest when coverage is enabled."""
    runner = load_runner_module()
    backend_root = tmp_path / "backend"
    report_dir = tmp_path / "reports"
    backend_root.mkdir()
    report_dir.mkdir()

    erase_calls = []

    def fake_run(cmd, cwd=None, stdout=None, stderr=None):
        erase_calls.append(
            {
                "cmd": cmd,
                "cwd": cwd,
                "stdout": stdout,
                "stderr": stderr,
            }
        )

        class Result:
            returncode = 0

        return Result()

    def fake_run_command(**kwargs):
        return runner.StepResult(
            name="backend",
            command=kwargs["command"],
            returncode=0,
            duration=0.0,
            status="ok",
        )

    monkeypatch.setattr(runner.subprocess, "run", fake_run)
    monkeypatch.setattr(runner, "run_command", fake_run_command)
    monkeypatch.setattr(
        runner,
        "read_backend_coverage_summary",
        lambda _backend_root: [
            "Statements: 100.00% (1/1)",
            "Branches: 100.00% (0/0)",
            "Functions: 100.00% (1/1)",
            "Lines: 100.00% (1/1)",
            "TOTAL: 100.00% (2/2)",
        ],
    )

    result = runner.run_backend(
        backend_root=backend_root,
        report_dir=report_dir,
        markers="",
        extra_args=[],
        coverage=True,
        quiet=True,
    )

    assert len(erase_calls) == 1
    assert erase_calls[0]["cmd"] == [sys.executable, "-m", "coverage", "erase"]
    assert erase_calls[0]["cwd"] == backend_root
    assert result.coverage == [
        "Statements: 100.00% (1/1)",
        "Branches: 100.00% (0/0)",
        "Functions: 100.00% (1/1)",
        "Lines: 100.00% (1/1)",
        "TOTAL: 100.00% (2/2)",
    ]


def test_run_frontend_unit_triggers_summary_script_when_enabled(
    tmp_path,
    monkeypatch,
):
    """Verify frontend unit summary script runs when the flag is enabled."""
    runner = load_runner_module()
    frontend_root = tmp_path / "frontend"
    report_dir = tmp_path / "reports"
    frontend_root.mkdir()
    report_dir.mkdir()

    calls: list[dict] = []

    def fake_run_command(**kwargs):
        calls.append(kwargs)
        return runner.StepResult(
            name=kwargs["name"],
            command=kwargs["command"],
            returncode=0,
            duration=0.0,
            status="ok",
        )

    monkeypatch.setattr(runner, "run_command", fake_run_command)
    monkeypatch.setattr(
        runner,
        "read_jest_coverage_summary",
        lambda _root: ["Statements: 100.00% (1/1)"],
    )

    result = runner.run_frontend_unit(
        frontend_root=frontend_root,
        report_dir=report_dir,
        extra_args=[],
        coverage=True,
        quiet=True,
    )

    assert result.coverage == ["Statements: 100.00% (1/1)"]
    assert [call["name"] for call in calls] == [
        "frontend-unit",
        "frontend-unit-summary",
    ]
    assert calls[0]["capture_coverage"] is True
    assert calls[1]["command"] == ["node", "scripts/coverage-summary.cjs"]
    assert calls[1]["append_log"] is True
    assert calls[1]["show_header"] is False
    assert calls[1]["log_path"] == report_dir / "frontend-unit.log"
