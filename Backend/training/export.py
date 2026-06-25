"""Exports the trained model to ONNX and copies it to the detector."""
from __future__ import annotations

import shutil

import joblib
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType

N_FEATURES = 4  # must match ml/features.go
OUT = "../services/anomaly-detector/models/isolation_forest.onnx"


def main() -> None:
    model = joblib.load("data/isolation_forest.joblib")
    onx = to_onnx(model, initial_types=[("input", FloatTensorType([None, N_FEATURES]))])
    with open("data/isolation_forest.onnx", "wb") as f:
        f.write(onx.SerializeToString())
    shutil.copyfile("data/isolation_forest.onnx", OUT)
    print(f">> exported ONNX -> {OUT}")


if __name__ == "__main__":
    main()
