package report

import (
	"time"

	"github.com/securecode5g/test-runner/internal/executor"
)

// TestRunReport aggregates all test results for a run.
type TestRunReport struct {
	RunID     string                `json:"runId"`
	Core      string                `json:"core"`
	StartedAt time.Time             `json:"startedAt"`
	Duration  time.Duration         `json:"duration"`
	Results   []executor.TestResult `json:"results"`
	Passed    int                   `json:"passed"`
	Failed    int                   `json:"failed"`
}

// Reporter accumulates results into a report.
type Reporter struct {
	report TestRunReport
}

// New builds a Reporter for a run.
func New(runID, core string) *Reporter {
	return &Reporter{report: TestRunReport{RunID: runID, Core: core, StartedAt: time.Now()}}
}

// Add records a single test result.
func (r *Reporter) Add(res executor.TestResult) {
	r.report.Results = append(r.report.Results, res)
	if res.Status == executor.StatusPass {
		r.report.Passed++
	} else {
		r.report.Failed++
	}
}

// Finish stamps the duration and returns the report.
func (r *Reporter) Finish() TestRunReport {
	r.report.Duration = time.Since(r.report.StartedAt)
	return r.report
}
