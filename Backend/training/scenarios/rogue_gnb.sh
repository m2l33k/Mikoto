#!/usr/bin/env bash
# Attack C: gNB authenticates then requests identity without AKA (rogue gNB).
set -euo pipefail
echo "[rogue_gnb] gNB requests UE identity without completing AKA"
# TODO: drive a misbehaving nr-gnb.
