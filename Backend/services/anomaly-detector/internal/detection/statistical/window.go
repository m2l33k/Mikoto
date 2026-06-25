package statistical

import (
	"sync"
	"time"
)

type sample struct {
	t time.Time
	v float64
}

// Window is a rolling time window of scalar samples (default 1h) used by the
// z-score and IQR detectors.
type Window struct {
	mu      sync.Mutex
	dur     time.Duration
	samples []sample
}

// NewWindow builds a rolling window of the given duration.
func NewWindow(d time.Duration) *Window { return &Window{dur: d} }

// Add appends a sample and evicts entries older than the window.
func (w *Window) Add(t time.Time, v float64) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.samples = append(w.samples, sample{t, v})
	cutoff := t.Add(-w.dur)
	i := 0
	for i < len(w.samples) && w.samples[i].t.Before(cutoff) {
		i++
	}
	w.samples = w.samples[i:]
}

// Values returns a copy of the current sample values.
func (w *Window) Values() []float64 {
	w.mu.Lock()
	defer w.mu.Unlock()
	out := make([]float64, len(w.samples))
	for i, s := range w.samples {
		out[i] = s.v
	}
	return out
}
