import ast
import os
from pathlib import Path

import coverage as coverage_module
import pytest

_MINI_W = 13
_WIDE_W = 15


def _color_for(pct):
    if pct > 80:
        return "green"
    if pct >= 50:
        return "yellow"
    return "red"


def _bar(pct, width):
    filled = round(pct / 100 * width)
    return "█" * filled + "·" * (width - filled)


def _function_body_lines(node: ast.AST) -> set[int]:
    lines: set[int] = set()
    for stmt in getattr(node, "body", []):
        start = getattr(stmt, "lineno", None)
        if start is None:
            continue
        end = getattr(stmt, "end_lineno", start) or start
        lines.update(range(start, end + 1))
    return lines


def _function_coverage_from_source(
    source: str,
    executed_lines: set[int],
) -> tuple[int, int]:
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return 0, 0
    total = 0
    covered = 0
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            total += 1
            body_lines = _function_body_lines(node)
            if body_lines and body_lines.intersection(executed_lines):
                covered += 1
    return total, covered


def pytest_sessionstart(session) -> None:
    cov_plugin = session.config.pluginmanager.get_plugin("_cov")
    if cov_plugin is None:
        return
    hook = session.config.pluginmanager.hook.pytest_terminal_summary
    for impl in hook.get_hookimpls():
        if impl.plugin is cov_plugin:
            impl.function = lambda *args, **kw: None
            break


@pytest.hookimpl(tryfirst=True)
def pytest_configure(config):
    try:
        if hasattr(config.option, "cov_report"):
            config.option.cov_report = [
                r for r in config.option.cov_report
                if not r.startswith("term")
            ]
    except Exception:
        pass


@pytest.hookimpl(trylast=True)
def pytest_terminal_summary(terminalreporter, exitstatus, config):
    cov_file = os.path.join(os.path.dirname(__file__), ".coverage")
    if not os.path.exists(cov_file):
        return

    try:
        cov = coverage_module.Coverage(data_file=cov_file)
        cov.load()
    except Exception:
        return

    results = []
    try:
        measured = cov.get_data().measured_files()
    except Exception:
        return

    total_branches = 0
    total_missing_branches = 0
    total_functions = 0
    total_covered_functions = 0

    for filepath in measured:
        norm = filepath.replace("\\", "/")
        if "base_feature_app" not in norm or "/tests/" in norm:
            continue
        try:
            analysis = cov._analyze(filepath)
            stmts = len(analysis.statements)
            if stmts == 0:
                continue
            missing = len(analysis.missing)
            pct = (stmts - missing) / stmts * 100
            idx = norm.find("base_feature_app")
            short = norm[idx:] if idx >= 0 else norm
            results.append(
                {
                    "path": short,
                    "stmts": stmts,
                    "missing": missing,
                    "pct": pct,
                    "missing_lines": list(analysis.missing),
                }
            )

            numbers = getattr(analysis, "numbers", None)
            if numbers is not None:
                total_branches += getattr(numbers, "n_branches", 0)
                total_missing_branches += getattr(numbers, "n_missing_branches", 0)

            executed_lines = getattr(analysis, "executed", None)
            if executed_lines is None:
                executed_lines = set(analysis.statements) - set(analysis.missing)
            else:
                executed_lines = set(executed_lines)
            try:
                source = Path(filepath).read_text(encoding="utf-8")
            except OSError:
                source = None
            if source is not None:
                functions_total, functions_covered = _function_coverage_from_source(
                    source,
                    executed_lines,
                )
                total_functions += functions_total
                total_covered_functions += functions_covered
        except Exception:
            continue

    if not results:
        return

    results.sort(key=lambda r: r["path"])

    total_stmts = sum(r["stmts"] for r in results)
    total_missing = sum(r["missing"] for r in results)
    covered_stmts = total_stmts - total_missing
    covered_branches = total_branches - total_missing_branches
    covered_functions = total_covered_functions
    total_covered = covered_stmts + covered_branches + covered_functions
    total_count = total_stmts + total_branches + total_functions
    total_missing_combined = total_count - total_covered
    total_pct = total_covered / total_count * 100 if total_count > 0 else 0

    top_n = sorted(
        [r for r in results if r["missing"] > 0],
        key=lambda x: (x["pct"], -x["missing"]),
    )[:3]

    try:
        term_w = terminalreporter._tw._width
    except AttributeError:
        import shutil
        term_w = shutil.get_terminal_size().columns

    # fixed cols: 2 indent + 2 sep + 5 count + 2 sep + 4 miss + 2 sep + 7 pct% + 2 sep + 1 [ + MINI_W + 1 ]
    _FIXED = 2 + 2 + 5 + 2 + 4 + 2 + 7 + 2 + 1 + _MINI_W + 1
    max_path_w = max(term_w - _FIXED - 2, 20)  # -2 safety margin
    actual_max = max((len(r["path"]) for r in results), default=40)
    path_w = min(max_path_w, actual_max)
    path_w = max(path_w, 20)

    for r in results:
        if len(r["path"]) > path_w:
            r["path"] = r["path"][: path_w - 1] + "…"

    tw = terminalreporter
    tw.write_sep("=", "COVERAGE REPORT", bold=True)
    tw.write("\n")

    for r in results:
        color = _color_for(r["pct"])
        mini = _bar(r["pct"], _MINI_W)
        tw.write(f"  {r['path']:<{path_w}}  {r['stmts']:>5}  {r['missing']:>4}  ")
        tw.write(f"{r['pct']:>6.1f}%  ", **{color: True})
        tw.write("[")
        tw.write(mini, **{color: True})
        tw.write("]\n")

    tw.write("\n")
    c = _color_for(total_pct)
    wide = _bar(total_pct, _WIDE_W)
    tw.write(f"  {'TOTAL':<{path_w}}  {total_count:>5}  {total_missing_combined:>4}  ", bold=True)
    tw.write(f"{total_pct:>6.1f}%  ", bold=True, **{c: True})
    tw.write("[", bold=True)
    tw.write(wide, bold=True, **{c: True})
    tw.write("]\n\n", bold=True)

    dash = "─" * 10
    n = len(top_n)
    label = f"Top-{n} files to focus on" if top_n else "All files fully covered"
    tw.write(f"  {dash}  {label}  ", bold=True)
    tw.write(f"(total project: {total_pct:.1f}%)  ", bold=True)
    tw.write(f"{dash}\n", bold=True)

    if not top_n:
        tw.write("\n", green=True)
    else:
        for i, r in enumerate(top_n, 1):
            color = _color_for(r["pct"])
            mini = _bar(r["pct"], _MINI_W)
            tw.write(f"  {i}.  ")
            tw.write(f"{r['pct']:>5.1f}%", **{color: True})
            tw.write("  [")
            tw.write(mini, **{color: True})
            tw.write(f"]  {r['path']}")
            tw.write(f"   ({r['missing']} lines uncovered)\n")
        tw.write("\n")
