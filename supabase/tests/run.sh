#!/usr/bin/env bash
# Runs the database security suite against a throwaway Postgres database.
#   PGHOST/PGPORT/PGUSER must point at a server where we can create databases.
# Usage: supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="mentalpath_test_$$"
PSQL=(psql -v ON_ERROR_STOP=1 -q -X)
"${PSQL[@]}" -d postgres -c "CREATE DATABASE $DB" >/dev/null
trap '"${PSQL[@]}" -d postgres -c "DROP DATABASE IF EXISTS $DB" >/dev/null' EXIT

"${PSQL[@]}" -d "$DB" -f tests/00_supabase_shim.sql >/dev/null
for m in migrations/*.sql; do
  "${PSQL[@]}" -d "$DB" -f "$m" >/dev/null 2>&1 || { echo "FAILED migration: $m"; "${PSQL[@]}" -d "$DB" -f "$m"; exit 1; }
done
echo "✓ migrations applied ($(ls migrations/*.sql | wc -l))"

status=0
for t in tests/[1-9]*.sql; do
  if out=$("${PSQL[@]}" -o /dev/null -d "$DB" -f "$t" 2>&1); then
    echo "✓ $(basename "$t")"
  else
    echo "✗ $(basename "$t")"; echo "$out" | sed 's/^/    /'; status=1
  fi
done
exit $status
