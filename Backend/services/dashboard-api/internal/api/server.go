package api

import (
	"net/http"

	"github.com/securecode5g/dashboard-api/internal/auth"
)

// Server is the dashboard backend. All /api routes require a Casdoor OIDC JWT.
type Server struct {
	mux  *http.ServeMux
	mw   *auth.Middleware
	deps Deps
}

// Deps are the wired collaborators (proxies, cert reader, multiplexer).
type Deps struct {
	AlertsProxy  http.Handler
	MetricsProxy http.Handler
	RunsProxy    http.Handler
}

// New wires routes. Public auth routes are unauthenticated; everything under
// /api requires a valid token.
func New(mw *auth.Middleware, deps Deps) *Server {
	s := &Server{mux: http.NewServeMux(), mw: mw, deps: deps}
	s.routes()
	return s
}

func (s *Server) routes() {
	// Public
	s.mux.HandleFunc("GET /auth/callback", s.authCallback)

	// Protected (management plane)
	s.mux.Handle("GET /api/v1/alerts", s.mw.Require(s.deps.AlertsProxy))
	s.mux.Handle("GET /api/v1/metrics", s.mw.Require(s.deps.MetricsProxy))
	s.mux.Handle("GET /api/v1/certs", s.mw.Require(http.HandlerFunc(s.certs)))
	s.mux.Handle("GET /api/v1/runs", s.mw.Require(s.deps.RunsProxy))
	s.mux.Handle("GET /api/v1/stream", s.mw.Require(http.HandlerFunc(s.stream)))
}

// Handler returns the HTTP handler.
func (s *Server) Handler() http.Handler { return s.mux }
