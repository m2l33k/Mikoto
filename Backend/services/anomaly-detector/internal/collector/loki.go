package collector

import (
	"context"
	"net/http"
	"time"
)

// Loki queries Loki LogQL for NAS message sequences (e.g. SUCI probe patterns).
type Loki struct {
	baseURL string
	http    *http.Client
}

// NewLoki builds a Loki collector.
func NewLoki(baseURL string) *Loki {
	return &Loki{baseURL: baseURL, http: &http.Client{Timeout: 10 * time.Second}}
}

// NASSequences runs a LogQL query over the given window and returns ordered
// NAS message types per UE/connection.
func (l *Loki) NASSequences(ctx context.Context, since time.Duration) (map[string][]string, error) {
	// TODO: LogQL query_range against /loki/api/v1/query_range.
	_, _ = ctx, since
	return map[string][]string{}, nil
}
