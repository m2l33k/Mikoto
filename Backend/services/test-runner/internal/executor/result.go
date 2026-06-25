package executor

import "time"

// Status is the outcome of a test or step.
type Status string

const (
	StatusPass    Status = "PASS"
	StatusFail    Status = "FAIL"
	StatusError   Status = "ERROR"
	StatusSkipped Status = "SKIPPED"
)

// Evidence references an artifact captured during a test (e.g. a pcap file).
type Evidence struct {
	Kind string `json:"kind"` // "pcap" | "log"
	Path string `json:"path"`
}

// StepResult is the outcome of a single step.
type StepResult struct {
	Name     string        `json:"name"`
	Status   Status        `json:"status"`
	Duration time.Duration `json:"duration"`
	Message  string        `json:"message,omitempty"`
}

// TestResult aggregates step results for one scenario.
type TestResult struct {
	ScenarioID string       `json:"scenarioId"`
	Status     Status       `json:"status"`
	Steps      []StepResult `json:"steps"`
	Evidence   []Evidence   `json:"evidence"`
	StartedAt  time.Time    `json:"startedAt"`
	Duration   time.Duration `json:"duration"`
}
