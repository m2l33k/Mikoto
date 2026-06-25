package api

import "net/http"

func (s *Server) metricsSummary(w http.ResponseWriter, r *http.Request) {
	// TODO: return aggregate counts (alerts by severity, last snapshot kpis).
	// GET /api/v1/metrics/summary
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
