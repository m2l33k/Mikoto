"""Records labeled Prometheus metric snapshots per scenario.

Runs each scenario script under training/scenarios/, samples the same feature set
the Go detector uses (see anomaly-detector/internal/detection/ml/features.go), and
writes a labeled dataset to data/dataset.parquet.
"""
from __future__ import annotations

import os
import subprocess
import time

PROM = os.environ.get("PROMETHEUS_URL", "http://localhost:9090")

# Feature order MUST match ml/features.go Extract().
FEATURES = [
    "registration_rate",
    "auth_failure_rate",
    "pdu_session_count",
    "heartbeat_misses",
]

SCENARIOS = {
    "normal": "scenarios/normal.sh",
    "imsi_enum": "scenarios/imsi_enum.sh",
    "reg_flood": "scenarios/reg_flood.sh",
    "rogue_gnb": "scenarios/rogue_gnb.sh",
    "session_hijack": "scenarios/session_hijack.sh",
}


def run_scenario(label: str, script: str) -> None:
    # TODO: launch scenario, poll Prometheus for FEATURES, append rows with `label`.
    subprocess.run(["bash", script], check=False)
    time.sleep(1)


def main() -> None:
    for label, script in SCENARIOS.items():
        print(f">> collecting: {label}")
        run_scenario(label, script)
    # TODO: write pandas DataFrame -> data/dataset.parquet


if __name__ == "__main__":
    main()
