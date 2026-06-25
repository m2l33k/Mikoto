package ml

// Model wraps a loaded ONNX isolation-forest session and its version metadata.
type Model struct {
	Path    string
	Version string
	// TODO: *ort.AdvancedSession
}

// LoadModel loads an ONNX model from disk via onnxruntime_go.
func LoadModel(path string) (*Model, error) {
	// TODO: ort.InitializeEnvironment(); create session for input/output tensors.
	return &Model{Path: path, Version: "unknown"}, nil
}

// Close releases the ONNX session.
func (m *Model) Close() error { return nil }
