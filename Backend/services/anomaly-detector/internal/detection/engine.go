package detection

import (
	"context"

	"github.com/securecode5g/anomaly-detector/internal/alerts"
	"github.com/securecode5g/anomaly-detector/internal/collector"
	"github.com/securecode5g/anomaly-detector/internal/detection/ml"
	"github.com/securecode5g/anomaly-detector/internal/detection/rules"
	"github.com/securecode5g/anomaly-detector/internal/detection/statistical"
)

// Phase evaluates a snapshot and returns any alerts it raises.
type Phase interface {
	Name() string
	Evaluate(ctx context.Context, snap *collector.Snapshot) ([]alerts.Alert, error)
}

// Engine orchestrates the three detection phases in parallel and merges output.
type Engine struct {
	phases []Phase
}

// NewEngine wires the rule, statistical and ML phases.
func NewEngine(ruleEng *rules.Engine, stat *statistical.Detector, inf *ml.Inference) *Engine {
	return &Engine{phases: []Phase{ruleEng, stat, inf}}
}

// Evaluate runs every phase concurrently and returns the merged alert set.
func (e *Engine) Evaluate(ctx context.Context, snap *collector.Snapshot) []alerts.Alert {
	type res struct{ a []alerts.Alert }
	ch := make(chan res, len(e.phases))
	for _, p := range e.phases {
		go func(p Phase) {
			out, _ := p.Evaluate(ctx, snap)
			ch <- res{out}
		}(p)
	}
	var merged []alerts.Alert
	for range e.phases {
		merged = append(merged, (<-ch).a...)
	}
	return merged
}
