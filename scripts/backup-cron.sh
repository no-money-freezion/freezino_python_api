#!/bin/bash
# backup-cron.sh — lightweight SQLite snapshot for cron.
#
# Runs from /opt/freezino_python_api (or wherever the repo is checked
# out — it cd's to its own parent). Snapshots the live SQLite file out
# of the backend container into ./backups/ and rotates out anything
# older than 14 days.
#
# Called from cron — must be QUIET on success and NEVER fail loudly
# when the container is simply restarting, otherwise cron spams mail
# during every deploy. Exit 0 for "nothing to do" or "ok". Exit !=0
# only if something is actually broken (docker daemon down, filesystem
# full, etc.) and would stay broken across retries.
#
# Install the cron entry from docs/SERVER_BOOTSTRAP.md (daily 03:00).
# Tracked in DO-012.

set -u

# Always run from the repo root so `./backups/` is stable.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

BACKUP_DIR="./backups"
LOG_FILE="$BACKUP_DIR/cron.log"
CONTAINER="freezino-backend-prod"
DB_IN_CONTAINER="/app/data/freezino.db"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] $*" >> "$LOG_FILE"
}

# --- 1. Docker daemon reachable? ---
if ! docker info >/dev/null 2>&1; then
    log "SKIP: docker daemon not reachable"
    exit 0
fi

# --- 2. Container running? If not, we're mid-deploy — skip quietly. ---
if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
    log "SKIP: container '$CONTAINER' not running (deploy in progress?)"
    exit 0
fi

# --- 3. Snapshot ---
TIMESTAMP="$(date '+%Y%m%d-%H%M%S')"
BACKUP_FILE="$BACKUP_DIR/freezino-${TIMESTAMP}.db"

if docker cp "${CONTAINER}:${DB_IN_CONTAINER}" "$BACKUP_FILE" 2>/dev/null; then
    SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"
    log "OK: $BACKUP_FILE ($SIZE)"
else
    log "FAIL: docker cp returned $?"
    # Clean up any partial file.
    rm -f "$BACKUP_FILE"
    exit 2
fi

# --- 4. Rotate ---
REMOVED="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'freezino-*.db' -mtime "+${RETENTION_DAYS}" -print -delete 2>/dev/null | wc -l)"
if [ "$REMOVED" -gt 0 ]; then
    log "rotated: removed $REMOVED backup(s) older than ${RETENTION_DAYS} days"
fi

exit 0
