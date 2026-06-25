#!/usr/bin/env bash
# Generates the root CA and a peer cert per NF into the shared /certs volume.
# Usage: ./init.sh [--force] | ./init.sh status
set -euo pipefail

CERTS=/certs
NFS=(nrf amf smf upf ausf udm udr)

cmd_status() {
  for nf in "${NFS[@]}"; do
    crt="$CERTS/$nf/tls.crt"
    if [[ -f "$crt" ]]; then
      end=$(openssl x509 -enddate -noout -in "$crt" | cut -d= -f2)
      echo "$nf: notAfter=$end"
    else
      echo "$nf: MISSING"
    fi
  done
}

cmd_gen() {
  local force="${1:-}"
  mkdir -p "$CERTS"
  if [[ ! -f "$CERTS/ca.crt" || "$force" == "--force" ]]; then
    echo ">> generating root CA"
    cfssl gencert -initca ca-csr.json | cfssljson -bare "$CERTS/ca"
    mv "$CERTS/ca.pem" "$CERTS/ca.crt"
    mv "$CERTS/ca-key.pem" "$CERTS/ca.key"
  fi
  for nf in "${NFS[@]}"; do
    mkdir -p "$CERTS/$nf"
    sed "s/__NF_NAME__/$nf/g" nf-csr-template.json > "/tmp/$nf-csr.json"
    cfssl gencert -ca "$CERTS/ca.crt" -ca-key "$CERTS/ca.key" \
      -config ca-config.json -profile peer "/tmp/$nf-csr.json" \
      | cfssljson -bare "$CERTS/$nf/tls"
    mv "$CERTS/$nf/tls.pem" "$CERTS/$nf/tls.crt"
    mv "$CERTS/$nf/tls-key.pem" "$CERTS/$nf/tls.key"
    echo ">> issued cert for $nf"
  done
}

case "${1:-gen}" in
  status) cmd_status ;;
  *)      cmd_gen "${1:-}" ;;
esac
