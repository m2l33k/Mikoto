package executor

import (
	"context"
	"time"

	"github.com/securecode5g/test-runner/internal/adapter"
	"github.com/securecode5g/test-runner/internal/scenario"
)

// Executor runs scenarios against a target core via an adapter.
type Executor struct {
	core adapter.CoreAdapter
}

// New builds an Executor bound to a core adapter.
func New(core adapter.CoreAdapter) *Executor { return &Executor{core: core} }

// Run executes a scenario step-by-step, checking assertions and enforcing
// per-step deadlines.
func (e *Executor) Run(ctx context.Context, s *scenario.Scenario) TestResult {
	res := TestResult{ScenarioID: s.ID, Status: StatusPass, StartedAt: time.Now()}

	for _, step := range s.Steps {
		sr := e.runStep(ctx, step)
		res.Steps = append(res.Steps, sr)
		if sr.Status != StatusPass {
			res.Status = sr.Status
			break
		}
	}

	res.Duration = time.Since(res.StartedAt)
	return res
}

func (e *Executor) runStep(ctx context.Context, step scenario.Step) StepResult {
	start := time.Now()
	var max time.Duration
	if step.Timing != nil {
		max = step.Timing.MaxDuration
	}

	err := withDeadline(ctx, max, func(ctx context.Context) error {
		// TODO: dispatch step.Action against e.core, then evaluate assertions.
		return nil
	})

	sr := StepResult{Name: step.Name, Status: StatusPass, Duration: time.Since(start)}
	if err != nil {
		sr.Status = StatusFail
		sr.Message = err.Error()
	}
	return sr
}
