#!/usr/bin/env bash
# Initializes and unseals Vault, enables engines, writes policies.
# Dev/bootstrap only — production should use auto-unseal + recovery keys.
set -euo pipefail

export VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"

if ! vault status >/dev/null 2>&1; then
  vault operator init -key-shares=1 -key-threshold=1 -format=json > /vault/init.json
fi

UNSEAL=$(jq -r '.unseal_keys_b64[0]' /vault/init.json)
ROOT=$(jq -r '.root_token' /vault/init.json)
vault operator unseal "$UNSEAL" || true
export VAULT_TOKEN="$ROOT"

# Engines
vault secrets enable -path=secret kv-v2      || true
vault secrets enable pki                       || true
vault secrets tune -max-lease-ttl=87600h pki   || true

# Policies
for p in policies/*.hcl; do
  name=$(basename "$p" .hcl)
  vault policy write "$name" "$p"
done

echo ">> Vault initialized. Root token stored in /vault/init.json"
