package api

// Metric endpoints are served by reverse-proxying Prometheus
// (see Deps.MetricsProxy wired in server.go). Reserved for dashboard-specific
// metric shaping (e.g. pre-baked query templates).
