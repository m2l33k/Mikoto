#!/usr/bin/env bash
# Seeds initial KV secrets (IMSI keys, PLMN config, nrf-oauth2 signing key).
set -euo pipefail
export VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"

# nrf-oauth2 JWT signing key (RS256). Generate if absent.
if [[ ! -f /tmp/signing.key ]]; then
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out /tmp/signing.key
fi
vault kv put secret/nrf-oauth2/signing \
  private_key=@/tmp/signing.key kid="nrf-oauth2-1"

# Example IMSI key + PLMN config.
vault kv put secret/imsi-keys/default key="00112233445566778899aabbccddeeff"
vault kv put secret/plmn/default mcc="208" mnc="93"

echo ">> seeded KV secrets"
