#!/usr/bin/env bash
# Docker deployment: restrict NF-to-NF traffic to the SBI ports via iptables.
# Applied on the host (or an init container with NET_ADMIN). Default-deny
# between NF containers except where the 3GPP service graph requires it.
set -euo pipefail

# Example: only allow AMF -> AUSF/UDM/SMF/NRF on :8000.
# iptables -N SBI || true
# iptables -A SBI -p tcp --dport 8000 -j ACCEPT
# iptables -A SBI -j DROP
echo "TODO: define per-NF SBI allow rules matching the service graph"
