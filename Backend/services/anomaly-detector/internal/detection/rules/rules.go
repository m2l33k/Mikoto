package rules

import (
	"github.com/securecode5g/anomaly-detector/internal/alerts"
	"github.com/securecode5g/anomaly-detector/internal/collector"
)

// Rule is a deterministic threshold check over a snapshot.
type Rule struct {
	Type      string
	Severity  alerts.Severity
	Predicate func(*collector.Snapshot) bool
	Evidence  func(*collector.Snapshot) map[string]any
}

// DefaultRules returns the Phase-1 deterministic detection rules.
func DefaultRules() []Rule {
	return []Rule{
		{
			Type:     "reg_flood",
			Severity: alerts.SeverityCritical,
			Predicate: func(s *collector.Snapshot) bool {
				return s.RegistrationRate > 50 // >50 reg/s
			},
			Evidence: func(s *collector.Snapshot) map[string]any {
				return map[string]any{"registrationRate": s.RegistrationRate}
			},
		},
		{
			Type:     "auth_failure_spike",
			Severity: alerts.SeverityWarning,
			Predicate: func(s *collector.Snapshot) bool {
				return s.AuthFailureRate > 10
			},
			Evidence: func(s *collector.Snapshot) map[string]any {
				return map[string]any{"authFailureRate": s.AuthFailureRate}
			},
		},
		{
			Type:     "heartbeat_miss",
			Severity: alerts.SeverityCritical,
			Predicate: func(s *collector.Snapshot) bool {
				return s.HeartbeatMisses > 0
			},
			Evidence: func(s *collector.Snapshot) map[string]any {
				return map[string]any{"heartbeatMisses": s.HeartbeatMisses}
			},
		},
	}
}
