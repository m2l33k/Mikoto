package collector

import (
	"context"
	"net/http"
	"time"
)

// Prometheus polls the Prometheus HTTP API for metric snapshots.
type Prometheus struct {
	baseURL string
	http    *http.Client
}

// NewPrometheus builds a collector for the given Prometheus base URL.
func NewPrometheus(baseURL string) *Prometheus {
	return &Prometheus{baseURL: baseURL, http: &http.Client{Timeout: 10 * time.Second}}
}

// Collect queries /api/v1/query_range and assembles a Snapshot. Called every 5s.
func (p *Prometheus) Collect(ctx context.Context, at time.Time) (*Snapshot, error) {
	// TODO: run query_range for registration rate, auth failures, PDU sessions,
	//       heartbeat misses, per-NF p95 latency; populate Snapshot.
	_ = ctx
	return &Snapshot{Timestamp: at, NASMsgRates: map[string]float64{}, PerNFLatencyP95: map[string]float64{}}, nil
}
