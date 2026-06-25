# models/

`isolation_forest.onnx` is produced by the training pipeline:

```
make train-scenarios   # run UERANSIM attack scenarios, collect labeled traces
make train-model       # fit isolation forest (scikit-learn)
make export-model      # skl2onnx export -> copies the .onnx here
```

The committed binary is intentionally absent in this scaffold — run the pipeline
or drop a trained model at `isolation_forest.onnx`.
