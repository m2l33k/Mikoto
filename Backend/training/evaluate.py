"""Runs hold-out evaluation and prints precision/recall."""
from __future__ import annotations

from sklearn.metrics import classification_report


def main() -> None:
    # TODO: load hold-out split, predict (-1 anomaly / 1 normal),
    #       map to attack labels, print classification_report.
    y_true: list[int] = []
    y_pred: list[int] = []
    if y_true:
        print(classification_report(y_true, y_pred))
    else:
        print(">> no evaluation data; run collect.py + train.py first")


if __name__ == "__main__":
    main()
