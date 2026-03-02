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


def test_main_defaults_to_sequential_quiet(tmp_path, monkeypatch):
    """Verify main() runs all three suites sequentially with quiet=True and append_log=False by default."""
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
        ("backend", True, False),
        ("frontend-unit", True, False),
        ("frontend-e2e", True, False),
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
        "suites": {
            "backend": {"status": "ok", "returncode": 0},
            "frontend-unit": {"status": "failed", "returncode": 1},
            "frontend-e2e": {"returncode": 1},
        },
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
    assert set(summary["suites"].keys()) == {"backend", "frontend-unit", "frontend-e2e"}
    assert summary["suites"]["backend"]["status"] == "ok"
    assert summary["suites"]["frontend-unit"]["status"] == "ok"
    assert summary["suites"]["frontend-e2e"]["status"] == "ok"


def test_resume_exits_when_previous_run_ok(tmp_path, monkeypatch, capsys):
    """Verify --resume prints a re-run message and exits 0 without running any suite when all suites passed."""
    runner = load_runner_module()
    report_dir = tmp_path / "reports"
    report_dir.mkdir()
    resume_path = report_dir / runner.RESUME_FILENAME
    resume_payload = {
        "run_id": "prev",
        "generated_at": "2026-02-24T18:00:00Z",
        "suites": {
            "backend": {"status": "ok", "returncode": 0},
            "frontend-unit": {"status": "ok", "returncode": 0},
            "frontend-e2e": {"status": "ok", "returncode": 0},
        },
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
    assert "ejecuta el comando sin --resume" in output


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


def test_run_command_appends_log_separator(tmp_path, monkeypatch):
    """Verify run_command appends a log separator and new output after existing content when append_log=True."""
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
        quiet=True,
        run_id="run-123",
    )

    content = log_path.read_text(encoding="utf-8")
    assert content.startswith("OLD")
    assert "Run ID: run-123" in content
    assert "Suite: backend" in content
    assert "Command: pytest" in content
    assert "line-2" in content
    assert content.index("OLD") < content.index("Run ID: run-123") < content.index("line-2")
    assert result.status == "ok"


def test_read_backend_summary_returns_metric_lines(tmp_path, monkeypatch):
    """Verify backend summary aggregates non-test files under the backend app."""
    monkeypatch.setenv("NO_COLOR", "1")
    runner = load_runner_module()
    backend_root = tmp_path / "backend"
    backend_root.mkdir()
    (backend_root / ".coverage").write_text("", encoding="utf-8")

    app_dir = backend_root / runner.BACKEND_APP_NAME
    tests_dir = app_dir / "tests"
    other_dir = backend_root / "other_app"
    app_dir.mkdir()
    tests_dir.mkdir(parents=True)
    other_dir.mkdir()

    covered_file = app_dir / "views.py"
    test_file = tests_dir / "test_views.py"
    other_file = other_dir / "views.py"
    covered_file.write_text("def first():\n    return True\n", encoding="utf-8")
    test_file.write_text("", encoding="utf-8")
    other_file.write_text("", encoding="utf-8")

    class FakeNumbers:
        def __init__(self, n_statements, n_missing, n_branches, n_missing_branches):
            self.n_statements = n_statements
            self.n_missing = n_missing
            self.n_branches = n_branches
            self.n_missing_branches = n_missing_branches

    class FakeAnalysis:
        def __init__(self, numbers, executed):
            self.numbers = numbers
            self.executed = executed

    class FakeRegion:
        def __init__(self, kind, lines):
            self.kind = kind
            self.lines = lines

    class FakeFileReporter:
        def __init__(self, regions):
            self._regions = regions

        def code_regions(self):
            return self._regions

    class FakeCoverage:
        def __init__(self, analysis_map, reporter_map, measured_files):
            self._analysis_map = analysis_map
            self._reporter_map = reporter_map
            self._measured_files = measured_files

        def load(self):
            return None

        def get_data(self):
            return self

        def measured_files(self):
            return self._measured_files

        def _analyze(self, filepath):
            return self._analysis_map[str(filepath)]

        def _get_file_reporter(self, filepath):
            return self._reporter_map[str(filepath)]

    analysis_map = {
        str(covered_file): FakeAnalysis(
            FakeNumbers(n_statements=4, n_missing=1, n_branches=2, n_missing_branches=1),
            executed={1, 2},
        ),
    }
    reporter_map = {
        str(covered_file): FakeFileReporter(
            [
                FakeRegion("function", [1, 2]),
                FakeRegion("function", [4, 5]),
            ]
        ),
    }
    measured_files = [str(covered_file), str(test_file), str(other_file)]
    fake_module = types.SimpleNamespace(
        Coverage=lambda data_file: FakeCoverage(analysis_map, reporter_map, measured_files)
    )
    monkeypatch.setitem(sys.modules, "coverage", fake_module)

    lines = runner.read_backend_coverage_summary(backend_root)

    assert lines == [
        "Statements: 75.00% (3/4)",
        "Branches: 50.00% (1/2)",
        "Functions: 50.00% (1/2)",
        "Lines: 75.00% (3/4)",
        "Total: 66.67%",
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
        "Flows covered: 3/5 (60.00%)",
        "Partial: 1",
        "Failing: 1",
    ]


def test_print_final_report_groups_metric_lines(monkeypatch, capsys):
    """Verify final report prints metric lines for a suite with summary data."""
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
    assert "Final suite report" in output
    assert "Statements: 75.00% (3/4)" in output
    assert "Branches: 50.00% (1/2)" in output
    assert "Functions: 50.00% (1/2)" in output


def test_run_backend_erases_metrics_when_enabled(tmp_path, monkeypatch):
    """Verify run_backend erases metrics and targets the backend app when reporting is enabled."""
    runner = load_runner_module()
    backend_root = tmp_path / "backend"
    report_dir = tmp_path / "reports"
    backend_root.mkdir()
    report_dir.mkdir()

    erase_calls = []

    def fake_erase(root):
        erase_calls.append(root)

    calls = []

    def fake_run_command(**kwargs):
        calls.append(kwargs)
        return runner.StepResult(
            name="backend",
            command=kwargs["command"],
            returncode=0,
            duration=0.0,
            status="ok",
        )

    monkeypatch.setattr(runner, "erase_backend_coverage_data", fake_erase)
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
        show_coverage=True,
        quiet=True,
    )

    assert erase_calls == [backend_root]
    assert len(calls) == 1
    assert calls[0]["capture_coverage"] is True
    assert f"--cov={backend_root / runner.BACKEND_APP_NAME}" in calls[0]["command"]
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
    """Verify frontend unit runner reads summary metrics when the flag is enabled."""
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
        show_coverage=True,
        quiet=True,
    )

    assert result.coverage == ["Statements: 100.00% (1/1)"]
    assert len(calls) == 2
    assert calls[0]["name"] == "frontend-unit"
    assert calls[0]["capture_coverage"] is True
    assert "--coverage" in calls[0]["command"]
    assert calls[1]["name"] == "frontend-unit-summary"
    assert calls[1]["command"] == ["node", "scripts/coverage-summary.cjs"]
    assert calls[1]["append_log"] is True
    assert calls[1]["log_path"] == report_dir / "frontend-unit.log"
