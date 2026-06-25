package api

import (
	"net/http"

	"github.com/securecode5g/anomaly-detector/internal/alerts"
)

// Server exposes the REST + WebSocket API for the dashboard and test runner.
type Server struct {
	store *alerts.Store
	pub   *alerts.Publisher
	mux   *http.ServeMux
}

// New wires routes and returns the API server.
func New(store *alerts.Store, pub *alerts.Publisher) *Server {
	s := &Server{store: store, pub: pub, mux: http.NewServeMux()}
	s.routes()
	return s
}

func (s *Server) routes() {
	s.mux.HandleFunc("GET /api/v1/alerts", s.listAlerts)
	s.mux.HandleFunc("GET /api/v1/alerts/{id}", s.getAlert)
	s.mux.HandleFunc("POST /api/v1/alerts/{id}/ack", s.ackAlert)
	s.mux.HandleFunc("GET /api/v1/rules", s.listRules)
	s.mux.HandleFunc("POST /api/v1/rules", s.upsertRule)
	s.mux.HandleFunc("GET /api/v1/metrics/summary", s.metricsSummary)
	s.mux.HandleFunc("GET /api/v1/stream", s.stream)
}

// Handler returns the HTTP handler (for the http.Server in main).
func (s *Server) Handler() http.Handler { return s.mux }
