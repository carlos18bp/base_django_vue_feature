/**
 * Runs a one-off Django management command against the live e2e database.
 *
 * A handful of flows need a fixture (a staff user, a singleton row in a known
 * state) that the seeded dev/CI data does not provide. This shells out to
 * `manage.py shell -c "<code>"` synchronously, mirroring the Python binary
 * selection already used by the Django webServer entry in
 * playwright.config.mjs: CI uses `python` on PATH, local dev uses the
 * project's own venv. Callers run from `frontend/` (Playwright's cwd), so the
 * relative `../backend/manage.py` path matches the webServer command exactly.
 *
 * Uses execFileSync with an argv array (no shell), so the Python snippet is
 * passed as a single literal process argument — no quoting/escaping and no
 * shell-injection surface, unlike a concatenated `execSync` string.
 *
 * The e2e webServer's `runserver` process holds the same SQLite file open for
 * the whole run, so a one-off write from a separate `manage.py shell` process
 * can occasionally collide with it ("database is locked"). Each snippet here
 * is a single small, idempotent write, so one retry clears a transient lock.
 */
import { execFileSync } from 'node:child_process';

const PYTHON = process.env.CI ? 'python' : '../backend/venv/bin/python';

/**
 * @param {string} code - Python source run via `manage.py shell -c`.
 */
export function runDjangoShell(code) {
  const args = ['../backend/manage.py', 'shell', '-c', code];

  try {
    execFileSync(PYTHON, args, { stdio: 'pipe', encoding: 'utf-8' });
  } catch (err) {
    const output = `${err.stdout || ''}${err.stderr || ''}`;
    if (!/database is locked/i.test(output)) {
      throw err;
    }
    execFileSync(PYTHON, args, { stdio: 'pipe', encoding: 'utf-8' });
  }
}
