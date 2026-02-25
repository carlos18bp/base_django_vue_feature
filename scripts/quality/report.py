#!/usr/bin/env python3
"""
Quality Gate Report Renderer.

Reads a JSON report produced by ``test_quality_gate.py`` and renders a
human-readable summary to stdout.  Can also emit a Markdown file for use
in CI artefacts or PR comments.

Usage:
    python3 scripts/quality/report.py
    python3 scripts/quality/report.py --report-path test-results/test-quality-report.json
    python3 scripts/quality/report.py --format markdown --output report.md
    python3 scripts/quality/report.py --no-color
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# ANSI colours (disabled when --no-color or not a TTY)
# ---------------------------------------------------------------------------

class _Colors:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    RED    = "\033[91m"
    YELLOW = "\033[93m"
    GREEN  = "\033[92m"
    CYAN   = "\033[96m"
    DIM    = "\033[2m"


_NO_COLOR = _Colors()
for _attr in vars(_Colors):
    if not _attr.startswith("_"):
        setattr(_NO_COLOR, _attr, "")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_report(path: Path) -> dict[str, Any]:
    if not path.exists():
        print(f"ERROR: Report file not found: {path}", file=sys.stderr)
        sys.exit(2)
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"ERROR: Invalid JSON in report file: {exc}", file=sys.stderr)
        sys.exit(2)


def _score_color(score: int, c: _Colors) -> str:
    if score >= 80:
        return c.GREEN
    if score >= 60:
        return c.YELLOW
    return c.RED


def _severity_label(severity: str, c: _Colors) -> str:
    mapping = {
        "error":   f"{c.RED}ERROR  {c.RESET}",
        "warning": f"{c.YELLOW}WARNING{c.RESET}",
        "info":    f"{c.CYAN}INFO   {c.RESET}",
    }
    return mapping.get(severity.lower(), severity.upper().ljust(7))


# ---------------------------------------------------------------------------
# Terminal renderer
# ---------------------------------------------------------------------------

def render_terminal(report: dict[str, Any], c: _Colors, show_all: bool = False) -> None:
    summary = report.get("summary", {})
    score   = summary.get("quality_score", 0)
    status  = summary.get("status", "unknown")

    print(f"\n{c.BOLD}{'═' * 65}{c.RESET}")
    print(f"{c.BOLD}  TEST QUALITY REPORT{c.RESET}")
    print(f"{'═' * 65}")

    # Stats
    print(f"\n{c.CYAN}  Statistics:{c.RESET}")
    print(f"    Files scanned : {summary.get('total_files', 0)}")
    print(f"    Tests found   : {summary.get('total_tests', 0)}")
    print(f"    Semantic mode : {summary.get('semantic_rules', 'soft')}")
    ext = (summary.get("external_lint") or {})
    print(f"    External lint : {ext.get('mode', 'off')}")

    # Score
    sc = _score_color(score, c)
    print(f"\n{c.CYAN}  Quality Score:{c.RESET} {sc}{c.BOLD}{score}/100{c.RESET}")

    # Counts
    print(f"\n{c.CYAN}  Issues:{c.RESET}")
    print(f"    {c.RED}Errors  : {summary.get('errors', 0)}{c.RESET}")
    print(f"    {c.YELLOW}Warnings: {summary.get('warnings', 0)}{c.RESET}")
    print(f"    {c.CYAN}Info    : {summary.get('info', 0)}{c.RESET}")

    # By category
    by_cat = summary.get("issues_by_category") or {}
    if by_cat:
        print(f"\n{c.CYAN}  By Category:{c.RESET}")
        for cat, cnt in sorted(by_cat.items(), key=lambda x: -x[1]):
            print(f"    {cat}: {cnt}")

    # Timings
    timings = summary.get("timings") or {}
    if timings:
        print(f"\n{c.CYAN}  Timings (s):{c.RESET}")
        for key, val in timings.items():
            print(f"    {key}: {val}")

    # Status
    if status == "passed":
        print(f"\n{c.BOLD}  Status: {c.GREEN}✓ PASSED{c.RESET}")
    else:
        print(f"\n{c.BOLD}  Status: {c.RED}✗ FAILED{c.RESET}")
    print(f"{'═' * 65}\n")

    # Issues detail
    all_issues: list[dict] = (
        report.get("backend", {}).get("issues", []) +
        report.get("frontend", {}).get("unit", {}).get("issues", []) +
        report.get("frontend", {}).get("e2e", {}).get("issues", [])
    )

    errors   = [i for i in all_issues if i.get("severity") == "error"]
    warnings = [i for i in all_issues if i.get("severity") == "warning"]
    info     = [i for i in all_issues if i.get("severity") == "info"]

    to_show = errors + warnings + (info if show_all else [])

    if not to_show:
        if not show_all and info:
            print(f"{c.DIM}  (info issues hidden — use --show-all to display){c.RESET}\n")
        return

    print(f"{c.BOLD}  Issues Detail:{c.RESET}")
    for issue in to_show:
        sev   = issue.get("severity", "info")
        label = _severity_label(sev, c)
        path  = issue.get("file", "")
        line  = issue.get("line", "")
        rule  = issue.get("rule_id", "")
        msg   = issue.get("message", "")
        loc   = f"{path}:{line}" if line else path
        print(f"  [{label}] {c.DIM}{loc}{c.RESET}  {msg}  {c.DIM}({rule}){c.RESET}")

    if not show_all and info:
        print(f"\n{c.DIM}  ({len(info)} info issue(s) hidden — use --show-all){c.RESET}")
    print()


# ---------------------------------------------------------------------------
# Markdown renderer
# ---------------------------------------------------------------------------

def render_markdown(report: dict[str, Any]) -> str:
    summary = report.get("summary", {})
    score   = summary.get("quality_score", 0)
    status  = summary.get("status", "unknown")
    emoji   = "✅" if status == "passed" else "❌"

    lines: list[str] = [
        "## Test Quality Gate Report",
        "",
        f"**Status:** {emoji} `{status.upper()}`  |  **Score:** `{score}/100`",
        "",
        "### Statistics",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Files scanned | {summary.get('total_files', 0)} |",
        f"| Tests found | {summary.get('total_tests', 0)} |",
        f"| Semantic mode | {summary.get('semantic_rules', 'soft')} |",
        f"| Errors | {summary.get('errors', 0)} |",
        f"| Warnings | {summary.get('warnings', 0)} |",
        f"| Info | {summary.get('info', 0)} |",
        "",
    ]

    by_cat = summary.get("issues_by_category") or {}
    if by_cat:
        lines += ["### Issues by Category", "", "| Category | Count |", "|----------|-------|"]
        for cat, cnt in sorted(by_cat.items(), key=lambda x: -x[1]):
            lines.append(f"| {cat} | {cnt} |")
        lines.append("")

    all_issues: list[dict] = (
        report.get("backend", {}).get("issues", []) +
        report.get("frontend", {}).get("unit", {}).get("issues", []) +
        report.get("frontend", {}).get("e2e", {}).get("issues", [])
    )
    errors_and_warnings = [i for i in all_issues if i.get("severity") in ("error", "warning")]

    if errors_and_warnings:
        lines += ["### Issues", "", "| Severity | File | Rule | Message |", "|----------|------|------|---------|"]
        for issue in errors_and_warnings:
            sev  = issue.get("severity", "").upper()
            path = issue.get("file", "")
            line = issue.get("line", "")
            rule = issue.get("rule_id", "")
            msg  = issue.get("message", "").replace("|", "\\|")
            loc  = f"{path}:{line}" if line else path
            lines.append(f"| {sev} | `{loc}` | `{rule}` | {msg} |")
        lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Render a test_quality_gate.py JSON report.",
    )
    parser.add_argument(
        "--report-path",
        type=Path,
        default=Path("test-results/test-quality-report.json"),
        help="Path to the JSON report (default: test-results/test-quality-report.json)",
    )
    parser.add_argument(
        "--format",
        choices=["terminal", "markdown"],
        default="terminal",
        help="Output format (default: terminal)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Write output to this file instead of stdout",
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        help="Disable ANSI colours",
    )
    parser.add_argument(
        "--show-all",
        action="store_true",
        help="Include info-level issues in output",
    )
    args = parser.parse_args(argv)

    report = _load_report(args.report_path)

    if args.format == "markdown":
        content = render_markdown(report)
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(content, encoding="utf-8")
            print(f"Markdown report written to: {args.output}")
        else:
            print(content)
        return 0

    # Terminal
    use_color = not args.no_color and sys.stdout.isatty()
    c = _Colors() if use_color else _NO_COLOR  # type: ignore[assignment]
    render_terminal(report, c, show_all=args.show_all)  # type: ignore[arg-type]
    return 0 if report.get("summary", {}).get("status") == "passed" else 1


if __name__ == "__main__":
    sys.exit(main())
