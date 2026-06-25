"""Fits an isolation forest on the collected dataset."""
from __future__ import annotations

import joblib
from sklearn.ensemble import IsolationForest


def main() -> None:
    # TODO: load data/dataset.parquet, X = FEATURES columns.
    # X = df[FEATURES].to_numpy()
    model = IsolationForest(
        n_estimators=200,
        contamination="auto",
        random_state=42,
    )
    # model.fit(X)
    joblib.dump(model, "data/isolation_forest.joblib")
    print(">> trained isolation forest -> data/isolation_forest.joblib")


if __name__ == "__main__":
    main()
