#!/usr/bin/env bash
# Attack D: SMF receives Modify Session for an unknown session (hijack attempt).
set -euo pipefail
echo "[session_hijack] sending Modify Session for unknown session id"
# TODO: craft PFCP/SBI modify for a non-existent session.
