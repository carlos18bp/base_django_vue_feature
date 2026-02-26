# Systemd Services Installation

Templates in this directory are the **source of truth** for systemd service configuration. Actual installation happens server-side after merge.

## Huey Task Queue

1. Copy service file:
   ```bash
   sudo cp scripts/systemd/huey.service /etc/systemd/system/base_feature_project-huey.service
   ```

2. Edit paths in the service file to match your environment:
   - `User` / `Group`
   - `WorkingDirectory`
   - `ExecStart` (path to virtualenv python)

3. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable base_feature_project-huey
   sudo systemctl start base_feature_project-huey
   ```

4. Verify:
   ```bash
   sudo systemctl status base_feature_project-huey
   journalctl -u base_feature_project-huey -f
   ```

## Prerequisites

- **Redis** must be installed and running (`sudo systemctl status redis`)
- **Virtual environment** must exist at the configured path
- **`.env` file** must be present in `backend/` with production values
