import importlib.util
import re
import sys
import types
from pathlib import Path


CONFTEST_PATH = Path(__file__).resolve().parents[3] / "conftest.py"


class FakeTerminalWriter:
    def __init__(self, width=120):
        self._width = width


class FakeTerminalReporter:
    def __init__(self):
        self._tw = FakeTerminalWriter()
        self.output: list[str] = []

    def write(self, text, **_kwargs):
        self.output.append(text)

    def write_sep(self, sep, title, bold=False):
        self.output.append(f"{sep * 10} {title} {sep * 10}\n")


class FakeNumbers:
    def __init__(self, n_branches, n_missing_branches):
        self.n_branches = n_branches
        self.n_missing_branches = n_missing_branches


class FakeAnalysis:
    def __init__(self, statements, missing, numbers):
        self.statements = statements
        self.missing = missing
        self.numbers = numbers


class FakeCoverageData:
    def __init__(self, measured_files):
        self._measured_files = measured_files

    def measured_files(self):
        return self._measured_files


class FakeCoverage:
    def __init__(self, analysis_map, measured_files):
        self._analysis_map = analysis_map
        self._data = FakeCoverageData(measured_files)

    def load(self):
        return None

    def get_data(self):
        return self._data

    def _analyze(self, filepath):
        return self._analysis_map[str(filepath)]


def load_conftest_module():
    spec = importlib.util.spec_from_file_location("backend_conftest", CONFTEST_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules.pop(spec.name, None)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_terminal_summary_total_includes_functions(tmp_path, monkeypatch):
    """Verify terminal summary totals include functions in the combined counts."""
    conftest = load_conftest_module()

    app_dir = tmp_path / "base_feature_app"
    app_dir.mkdir()
    file_path = app_dir / "views.py"
    file_path.write_text(
        "def first():\n"
        "    return True\n"
        "\n"
        "def second():\n"
        "    return False\n",
        encoding="utf-8",
    )

    analysis_map = {
        str(file_path): FakeAnalysis(
            [1, 2, 4, 5],
            [5],
            FakeNumbers(n_branches=2, n_missing_branches=1),
        ),
    }
    measured_files = [str(file_path)]
    fake_module = types.SimpleNamespace(
        Coverage=lambda data_file: FakeCoverage(analysis_map, measured_files)
    )
    monkeypatch.setattr(conftest, "coverage_module", fake_module)

    cov_file = Path(conftest.__file__).parent / ".coverage"
    original_exists = conftest.os.path.exists

    def fake_exists(path):
        if Path(path) == cov_file:
            return True
        return original_exists(path)

    monkeypatch.setattr(conftest.os.path, "exists", fake_exists)

    reporter = FakeTerminalReporter()
    conftest.pytest_terminal_summary(reporter, exitstatus=0, config=None)

    output = "".join(reporter.output)
    total_line = next(line for line in output.splitlines() if "TOTAL" in line)
    match = re.search(r"TOTAL\s+(\d+)\s+(\d+)\s+(\d+\.\d)%", total_line)
    assert match is not None
    total_count, total_missing, total_pct = match.groups()
    assert total_count == "8"
    assert total_missing == "3"
    assert float(total_pct) == 62.5
