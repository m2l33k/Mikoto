package ml

import "github.com/securecode5g/anomaly-detector/internal/collector"

// FeatureVector is the ordered float32 input to the ONNX model. The order MUST
// match the training pipeline's feature extraction (training/collect.py).
type FeatureVector []float32

// Extract turns a metric snapshot into the model's input features.
func Extract(s *collector.Snapshot) FeatureVector {
	return FeatureVector{
		float32(s.RegistrationRate),
		float32(s.AuthFailureRate),
		float32(s.PDUSessionCount),
		float32(s.HeartbeatMisses),
	}
}
