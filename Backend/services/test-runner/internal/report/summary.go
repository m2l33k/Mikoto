package report

import (
	"fmt"
	"io"
)

// WriteSummary prints a terminal-friendly pass/fail summary.
func WriteSummary(w io.Writer, r TestRunReport) {
	fmt.Fprintf(w, "Run %s [%s]\n", r.RunID, r.Core)
	fmt.Fprintf(w, "  passed: %d  failed: %d  duration: %s\n",
		r.Passed, r.Failed, r.Duration)
	for _, res := range r.Results {
		fmt.Fprintf(w, "  %-8s %s (%s)\n", res.Status, res.ScenarioID, res.Duration)
	}
}
