# Shared helpers for the end-to-end checks. Sourced by the suites in this folder.
# Database access: set PSQL_URL (CI) or run the docker compose "db" service (local).
set -u
B=${1:-${BASE_URL:-http://localhost:3100}}
# These suites create orders and reset website settings: never point them at the live store.
case "$B" in
  http://localhost:*|http://127.0.0.1:*) ;;
  *) echo "Refusing to run against $B — end-to-end checks only run on a local test server." >&2; exit 2 ;;
esac
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
DIR=".e2e-tmp"; mkdir -p "$DIR"
PASS=0; FAIL=0
J='Content-Type: application/json'

sql() {
  if [ -n "${PSQL_URL:-}" ]; then
    PGOPTIONS="-c search_path=${SQLSCHEMA:-public}" psql "$PSQL_URL" -tAc "$1" | tr -d '\r'
  else
    docker compose exec -T -e PGOPTIONS="-c search_path=${SQLSCHEMA:-public}" db psql -U postgres -d "${SQLDB:-pkm_shop}" -tAc "$1" | tr -d '\r'
  fi
}
check() { # name expected actual
  if [ "$2" == "$3" ]; then PASS=$((PASS+1)); echo "  ok   $1"; else FAIL=$((FAIL+1)); echo "  FAIL $1 (expected $2, got $3)"; fi
}
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
finish() {
  echo
  echo "PASSED: $PASS   FAILED: $FAIL"
  [ "$FAIL" -eq 0 ]
}
