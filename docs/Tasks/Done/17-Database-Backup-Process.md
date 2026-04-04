# Database Backup Process

> **Context:** Render's free-tier PostgreSQL provides no automated backups and expires after 90 days. This checklist covers a repeatable manual backup process plus optional automation so no data is lost between deploys or in the event of a DB incident.

---

## What data is at risk

| Table | Risk if lost |
|---|---|
| `users` | User accounts, preferences — not reconstructible |
| `user_preferences` | Onboarding selections — not reconstructible |
| `donation_intents` | Donation history — not reconstructible |
| `charities` | Enriched nonprofit records, images, locations — partially reconstructible from seed migrations but any admin edits are lost |
| `charity_locations` | Lat/lng coordinates added post-seed — not reconstructible without re-geocoding |
| `magic_link_tokens` | Short-lived, disposable — no need to back up |
| `causes` | Seeded by migration 010 — fully reconstructible, low priority |

**Priority backup target: `users`, `user_preferences`, `donation_intents`, `charities`, `charity_locations`**

---

## Step 1 — Verify you have `pg_dump` available locally

- [ ] Run `pg_dump --version` in your terminal
- [ ] If missing, install via Homebrew: `brew install libpq && brew link --force libpq`
- [ ] Confirm version is 14+ to match Render's PostgreSQL version

---

## Step 2 — Locate your Render DATABASE_URL

- [ ] Log in to [render.com](https://render.com) → select your PostgreSQL instance
- [ ] Copy the **External Database URL** (not the internal one — that only works from within Render's network)
- [ ] It will look like: `postgresql://user:password@host:port/dbname`

---

## Step 3 — Run a full database dump

```bash
pg_dump \
  --no-acl \
  --no-owner \
  --format=custom \
  --file="backups/goodlocal_$(date +%Y%m%d_%H%M%S).dump" \
  "YOUR_RENDER_DATABASE_URL"
```

- [ ] Create a `backups/` directory in the project root (it is already `.gitignored` — **do not commit dumps**)
- [ ] Run the command above, replacing `YOUR_RENDER_DATABASE_URL` with the real value
- [ ] Confirm a `.dump` file appears in `backups/` and is non-zero in size (`ls -lh backups/`)

> `--format=custom` produces a compressed binary dump that `pg_restore` can use selectively. It is smaller than plain SQL and handles large text/bytea fields better.

---

## Step 4 — Verify the dump is readable

```bash
pg_restore --list backups/<your-dump-file>.dump | head -40
```

- [ ] Output should list table names including `users`, `charities`, `donation_intents`
- [ ] No error output means the file is valid

---

## Step 5 — Store the backup off-machine

Pick one or more:

- [ ] **iCloud / Google Drive**: Drag the `.dump` file into a cloud folder — simple, free
- [ ] **GitHub private repo** (for small DBs only): Add a separate private repo and push dumps there — not recommended once `donation_intents` grows
- [ ] **S3 / Backblaze B2**: Upload via `aws s3 cp` or `b2 upload-file` — best long-term option

At minimum, keep the last **3 dated dump files** and delete older ones to manage storage.

---

## Step 6 — Add `backups/` to `.gitignore`

- [ ] Open the root `.gitignore`
- [ ] Confirm `backups/` is listed — add it if not:
  ```
  # Database backups — never commit
  backups/
  ```

---

## Step 7 — Document how to restore (test this at least once)

**Restore to a local database for verification:**

```bash
# Create a local test database
createdb goodlocal_restore_test

# Restore into it
pg_restore \
  --no-acl \
  --no-owner \
  --dbname="goodlocal_restore_test" \
  backups/<your-dump-file>.dump

# Spot-check the data
psql goodlocal_restore_test -c "SELECT COUNT(*) FROM users;"
psql goodlocal_restore_test -c "SELECT COUNT(*) FROM charities;"
psql goodlocal_restore_test -c "SELECT COUNT(*) FROM donation_intents;"

# Clean up
dropdb goodlocal_restore_test
```

- [ ] Run through the restore steps above to confirm the dump is usable
- [ ] Record the row counts here after your first verified backup:
  - `users`: ___
  - `charities`: ___
  - `donation_intents`: ___

---

## Step 8 — Set a recurring reminder

Render free tier has **no automatic backups**. Until you move to a paid tier or implement automation (see below), you need to run this manually.

- [ ] Create a calendar reminder or task: **"Run GoodLocal DB backup"**
- [ ] Suggested cadence: **weekly** (or after any major admin data-entry session)

---

## Optional: Automate with a shell script

Create `scripts/backup-db.sh` in the repo:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="$(dirname "$0")/../backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT="$BACKUP_DIR/goodlocal_${TIMESTAMP}.dump"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Export it before running this script."
  exit 1
fi

echo "Dumping database to $OUTPUT ..."
pg_dump \
  --no-acl \
  --no-owner \
  --format=custom \
  --file="$OUTPUT" \
  "$DATABASE_URL"

echo "Done. File size: $(du -sh "$OUTPUT" | cut -f1)"

# Keep only the 10 most recent dumps
ls -t "$BACKUP_DIR"/*.dump | tail -n +11 | xargs -r rm --
echo "Old backups pruned. Current backups:"
ls -lh "$BACKUP_DIR"
```

- [ ] Create `backend/scripts/backup-db.sh` with the content above
- [ ] `chmod +x backend/scripts/backup-db.sh`
- [ ] Test: `DATABASE_URL="<your-render-url>" ./backend/scripts/backup-db.sh`
- [ ] Optionally wire into a cron job: `crontab -e` → `0 9 * * 1 DATABASE_URL=... /path/to/backup-db.sh >> ~/goodlocal-backup.log 2>&1`

---

## Before the Render free tier expires (90-day window)

- [ ] Note the DB creation date from the Render dashboard
- [ ] Set a calendar reminder 2 weeks before expiry
- [ ] Options at expiry:
  - Upgrade to Render's paid PostgreSQL ($7/month) — backups included
  - Migrate to Supabase free tier (longer-lived, daily backups on paid)
  - Migrate to Neon (serverless Postgres, generous free tier)
- [ ] Run a final full dump before any migration and verify restore works on the new instance

---

## Verification Checklist

- [ ] `pg_dump` available and correct version
- [ ] At least one `.dump` file created and verified readable via `pg_restore --list`
- [ ] Restore tested against a local DB with matching row counts
- [ ] Dump stored off-machine (cloud drive or equivalent)
- [ ] `backups/` in `.gitignore`
- [ ] Recurring backup reminder set
- [ ] Render DB expiry date noted with calendar alert
