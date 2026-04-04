#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/../../backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT="$BACKUP_DIR/goodlocal_${TIMESTAMP}.dump"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

echo "Backing up prod database to $OUTPUT ..."
pg_dump --no-acl --no-owner --format=custom --file="$OUTPUT" "$DATABASE_URL"
echo "Done. File size: $(du -sh "$OUTPUT" | cut -f1)"

# Keep only the 10 most recent dumps
ls -t "$BACKUP_DIR"/*.dump 2>/dev/null | tail -n +11 | xargs rm -f
echo "Backup complete."
