#!/usr/bin/env bash
# Local Supabase-shaped stack for integration tests:
#   Postgres (yours) + real GoTrue (auth) + real PostgREST + a tiny gateway.
# Applies GoTrue's migrations and then every file in supabase/migrations/.
#
#   PGHOST=... PGPORT=... PGUSER=postgres supabase/integration/stack.sh
#
# Requires a Postgres superuser that accepts TCP connections on 127.0.0.1:$PGPORT.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CACHE="$ROOT/.cache/integration"
AUTH_VERSION="v2.177.0"
POSTGREST_VERSION="v12.2.3"
DB="mentalpath_it_$$"
PGPORT="${PGPORT:-5432}"
export JWT_SECRET="integration-test-secret-at-least-32-characters-long"
export GOTRUE_PORT=9999 POSTGREST_PORT=3000 GATEWAY_PORT=54321

mkdir -p "$CACHE"
if [ ! -x "$CACHE/auth" ]; then
  curl -fsSL "https://github.com/supabase/auth/releases/download/${AUTH_VERSION}/auth-${AUTH_VERSION}-x86.tar.gz" | tar xz -C "$CACHE"
fi
if [ ! -x "$CACHE/postgrest" ]; then
  curl -fsSL "https://github.com/PostgREST/postgrest/releases/download/${POSTGREST_VERSION}/postgrest-${POSTGREST_VERSION}-linux-static-x64.tar.xz" | tar xJ -C "$CACHE"
fi

PSQL=(psql -v ON_ERROR_STOP=1 -q -X -h "${PGHOST:-127.0.0.1}" -p "$PGPORT" -U "${PGUSER:-postgres}")
PIDS=()
cleanup() {
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  "${PSQL[@]}" -d postgres -c "DROP DATABASE IF EXISTS $DB WITH (FORCE)" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "▸ creating database $DB"
"${PSQL[@]}" -d postgres -c "CREATE DATABASE $DB" >/dev/null
# Roles are cluster-wide: create them once, ignore "already exists".
sed "s/CURRENT_DATABASE_PLACEHOLDER/$DB/" "$ROOT/supabase/integration/bootstrap.sql" |
  awk '/^CREATE ROLE|^GRANT anon, authenticated, service_role TO authenticator|^ALTER ROLE/ { print "DO $$ BEGIN " $0 " EXCEPTION WHEN duplicate_object THEN NULL; END $$;"; next } { print }' |
  "${PSQL[@]}" -d "$DB" >/dev/null

echo "▸ GoTrue migrations"
export GOTRUE_DB_DRIVER=postgres
export DATABASE_URL="postgres://supabase_auth_admin:auth_admin@127.0.0.1:${PGPORT}/${DB}?sslmode=disable"
export GOTRUE_DB_NAMESPACE=auth GOTRUE_DB_MIGRATIONS_PATH="$CACHE/migrations"
export API_EXTERNAL_URL="http://127.0.0.1:${GATEWAY_PORT}/auth/v1" GOTRUE_API_HOST=127.0.0.1 PORT=$GOTRUE_PORT
export GOTRUE_SITE_URL="http://localhost:8765" GOTRUE_URI_ALLOW_LIST="http://localhost:8765/**"
export GOTRUE_JWT_SECRET="$JWT_SECRET" GOTRUE_JWT_EXP=3600 GOTRUE_JWT_AUD=authenticated
export GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated GOTRUE_JWT_ADMIN_ROLES=service_role
export GOTRUE_MAILER_AUTOCONFIRM=true GOTRUE_EXTERNAL_EMAIL_ENABLED=true GOTRUE_DISABLE_SIGNUP=false
export GOTRUE_MFA_TOTP_ENROLL_ENABLED=true GOTRUE_MFA_TOTP_VERIFY_ENABLED=true GOTRUE_MFA_MAX_ENROLLED_FACTORS=10
export GOTRUE_PASSWORD_MIN_LENGTH=12 GOTRUE_SMTP_ADMIN_EMAIL=admin@example.test
export GOTRUE_RATE_LIMIT_EMAIL_SENT=1000 GOTRUE_RATE_LIMIT_VERIFY=1000 GOTRUE_RATE_LIMIT_TOKEN_REFRESH=1000 GOTRUE_RATE_LIMIT_OTP=1000
export GOTRUE_LOG_LEVEL=warn
"$CACHE/auth" migrate >/dev/null

echo "▸ app migrations"
"${PSQL[@]}" -d "$DB" -f "$ROOT/supabase/integration/post_auth.sql" >/dev/null
for m in "$ROOT"/supabase/migrations/*.sql; do
  "${PSQL[@]}" -d "$DB" -f "$m" >/dev/null 2>"$CACHE/migration.err" || { echo "✗ $m"; cat "$CACHE/migration.err"; exit 1; }
done

echo "▸ starting GoTrue, PostgREST, gateway"
"$CACHE/auth" serve >"$CACHE/gotrue.log" 2>&1 & PIDS+=($!)
PGRST_DB_URI="postgres://authenticator:authenticator@127.0.0.1:${PGPORT}/${DB}" \
PGRST_DB_SCHEMAS=public PGRST_DB_ANON_ROLE=anon PGRST_JWT_SECRET="$JWT_SECRET" \
PGRST_SERVER_PORT=$POSTGREST_PORT PGRST_SERVER_HOST=127.0.0.1 PGRST_LOG_LEVEL=warn \
  "$CACHE/postgrest" >"$CACHE/postgrest.log" 2>&1 & PIDS+=($!)
node "$ROOT/supabase/integration/proxy.mjs" >"$CACHE/gateway.log" 2>&1 & PIDS+=($!)

for i in $(seq 1 50); do
  if curl -fs "http://127.0.0.1:${GATEWAY_PORT}/auth/v1/health" >/dev/null && curl -fs "http://127.0.0.1:${GATEWAY_PORT}/rest/v1/" >/dev/null; then break; fi
  sleep 0.2
  [ "$i" = 50 ] && { echo "stack did not start"; tail -20 "$CACHE"/gotrue.log "$CACHE"/postgrest.log; exit 1; }
done

echo "▸ running integration tests"
export SUPABASE_URL="http://127.0.0.1:${GATEWAY_PORT}" PG_DB="$DB" PG_PORT="$PGPORT"
node --test "$ROOT"/supabase/integration/*.test.mjs
