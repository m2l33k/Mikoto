package rules

import (
	"context"
	"time"

	"github.com/google/uuid" // TODO: add to go.mod, or swap for crypto/rand id
	"github.com/securecode5g/anomaly-detector/internal/alerts"
	"github.com/securecode5g/anomaly-detector/internal/collector"
)

// Engine evaluates a set of rules against each snapshot (detection phase 1).
type Engine struct {
	rules []Rule
}

// NewEngine builds a rule engine. Pass DefaultRules() for the standard set.
func NewEngine(rs []Rule) *Engine { return &Engine{rules: rs} }

// Name implements detection.Phase.
func (e *Engine) Name() string { return "rules" }

// Evaluate runs every rule predicate and emits an alert per match.
func (e *Engine) Evaluate(_ context.Context, snap *collector.Snapshot) ([]alerts.Alert, error) {
	var out []alerts.Alert
	for _, r := range e.rules {
		if r.Predicate(snap) {
			out = append(out, alerts.Alert{
				ID:       uuid.NewString(),
				Severity: r.Severity,
				Type:     r.Type,
				Signal:   alerts.SignalRule,
				Evidence: r.Evidence(snap),
				TS:       time.Now(),
			})
		}
	}
	return out, nil
}
