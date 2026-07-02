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
	s.mux.HandleFunc("POST /auth/login", s.login)
	s.mux.HandleFunc("POST /auth/recover", s.recoverKeys)

	// Session (token required)
	s.mux.Handle("GET /auth/session", s.mw.Require(http.HandlerFunc(s.getSession)))
	s.mux.Handle("POST /auth/logout", s.mw.Require(http.HandlerFunc(s.logout)))

	// Shell (workflowbackend.md §3)
	s.mux.Handle("GET /api/v1/environments", s.mw.Require(http.HandlerFunc(s.listEnvironments)))
	s.mux.Handle("PUT /api/v1/me/environment", s.mw.Require(http.HandlerFunc(s.switchEnvironment)))
	s.mux.Handle("GET /api/v1/system/status", s.mw.Require(http.HandlerFunc(s.systemStatus)))
	s.mux.Handle("GET /api/v1/notifications", s.mw.Require(http.HandlerFunc(s.listNotifications)))
	s.mux.Handle("POST /api/v1/notifications/read", s.mw.Require(http.HandlerFunc(s.markNotificationsRead)))

	// Overview dashboard (workflowbackend.md §4)
	s.mux.Handle("GET /api/v1/dashboard/kpis", s.mw.Require(http.HandlerFunc(s.dashboardKpis)))
	s.mux.Handle("GET /api/v1/nf/health", s.mw.Require(http.HandlerFunc(s.nfHealth)))
	s.mux.Handle("GET /api/v1/events", s.mw.Require(http.HandlerFunc(s.listEvents)))
	s.mux.Handle("GET /api/v1/dashboard/export", s.mw.Require(http.HandlerFunc(s.exportDashboard)))
	s.mux.Handle("POST /api/v1/alerts/ack-all", s.mw.Require(http.HandlerFunc(s.ackAllAlerts)))
	s.mux.Handle("POST /api/v1/diagnostics/run", s.mw.Require(http.HandlerFunc(s.runDiagnostics)))

	// Protected (management plane — existing proxies)
	s.mux.Handle("GET /api/v1/alerts", s.mw.Require(s.deps.AlertsProxy))
	s.mux.Handle("GET /api/v1/metrics", s.mw.Require(s.deps.MetricsProxy))
	s.mux.Handle("GET /api/v1/certs", s.mw.Require(http.HandlerFunc(s.certs)))
	s.mux.Handle("GET /api/v1/runs", s.mw.Require(s.deps.RunsProxy))
	s.mux.Handle("GET /api/v1/stream", s.mw.Require(http.HandlerFunc(s.stream)))
}

// Handler returns the HTTP handler.
func (s *Server) Handler() http.Handler { return s.mux }
