package ml

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/securecode5g/anomaly-detector/internal/alerts"
	"github.com/securecode5g/anomaly-detector/internal/collector"
)

// Inference is detection phase 3: ONNX isolation-forest scoring.
type Inference struct {
	model     *Model
	threshold float64 // anomaly-score threshold above which an alert fires
}

// NewInference builds the ML phase around a loaded model.
func NewInference(m *Model, threshold float64) *Inference {
	return &Inference{model: m, threshold: threshold}
}

// Name implements detection.Phase.
func (i *Inference) Name() string { return "ml" }

// Evaluate extracts features and runs ONNX inference, flagging anomalies.
func (i *Inference) Evaluate(_ context.Context, snap *collector.Snapshot) ([]alerts.Alert, error) {
	feats := Extract(snap)
	score, err := i.score(feats)
	if err != nil {
		return nil, err
	}
	if score > i.threshold {
		return []alerts.Alert{{
			ID:       uuid.NewString(),
			Severity: alerts.SeverityWarning,
			Type:     "ml_anomaly",
			Signal:   alerts.SignalML,
			Evidence: map[string]any{"score": score, "model": i.model.Version},
			TS:       time.Now(),
		}}, nil
	}
	return nil, nil
}

// score runs a single forward pass and returns the anomaly score.
func (i *Inference) score(feats FeatureVector) (float64, error) {
	// TODO: build input tensor from feats, run i.model session, read output.
	_ = feats
	return 0, nil
}
