package alerts

import "time"

// Severity ranks an alert.
type Severity string

const (
	SeverityInfo     Severity = "info"
	SeverityWarning  Severity = "warning"
	SeverityCritical Severity = "critical"
)

// Signal names the detection phase that raised the alert.
type Signal string

const (
	SignalRule        Signal = "rule"
	SignalStatistical Signal = "statistical"
	SignalML          Signal = "ml"
)

// Alert is a single security finding emitted by the detection engine.
type Alert struct {
	ID       string         `json:"id"`
	Severity Severity       `json:"severity"`
	Type     string         `json:"type"`   // e.g. "reg_flood", "imsi_enum"
	Signal   Signal         `json:"signal"`
	Evidence map[string]any `json:"evidence"`
	TS       time.Time      `json:"ts"`
	Acked    bool           `json:"acked"`
}
