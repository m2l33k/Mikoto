#!/usr/bin/env bash
# Seeds Casdoor organization, roles and OIDC applications via its API.
set -euo pipefail

CASDOOR="${CASDOOR_ENDPOINT:-http://casdoor:8000}"
ADMIN_TOKEN="${CASDOOR_ADMIN_TOKEN:?set CASDOOR_ADMIN_TOKEN}"

post() {
  curl -fsS -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" -d @"$2" "$CASDOOR$1"
}

# Order matters: org -> users/roles -> applications.
post "/api/add-organization" org.json
post "/api/add-application"  app.json
echo ">> Casdoor seeded"
