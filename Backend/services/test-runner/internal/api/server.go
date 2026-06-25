package api

import "net/http"

// Server exposes the test-runner REST + WebSocket API.
type Server struct {
	mux *http.ServeMux
}

// New wires routes and returns the API server.
func New() *Server {
	s := &Server{mux: http.NewServeMux()}
	s.routes()
	return s
}

func (s *Server) routes() {
	s.mux.HandleFunc("GET /api/v1/scenarios", s.listScenarios)
	s.mux.HandleFunc("POST /api/v1/runs", s.createRun)
	s.mux.HandleFunc("GET /api/v1/runs/{id}", s.getRun)
	s.mux.HandleFunc("DELETE /api/v1/runs/{id}", s.deleteRun)
	s.mux.HandleFunc("GET /api/v1/runs/{id}/pcap/{tc}", s.getPcap)
	s.mux.HandleFunc("GET /api/v1/runs/{id}/stream", s.stream)
}

// Handler returns the HTTP handler.
func (s *Server) Handler() http.Handler { return s.mux }
