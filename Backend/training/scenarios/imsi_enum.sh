#!/usr/bin/env bash
# Attack A: sequential SUCI probes with no AKA completion (IMSI enumeration).
set -euo pipefail
echo "[imsi_enum] sending sequential SUCI probes, aborting before AKA"
# TODO: emit SUCI registration attempts across an IMSI range.
