package server

import (
	"context"
	"net/http"

	"github.com/securecode5g/nrf-oauth2/internal/config"
)

// Server is the HTTP/2 OAuth2 authorization server.
type Server struct {
	cfg *config.Config
	mux *http.ServeMux
	srv *http.Server
}

// New wires routes and returns a Server. Handlers from internal/api are
// registered here.
func New(cfg *config.Config) *Server {
	mux := http.NewServeMux()
	s := &Server{
		cfg: cfg,
		mux: mux,
		srv: &http.Server{Addr: cfg.ListenAddr, Handler: Chain(mux, Logging, RateLimit)},
	}
	s.routes()
	return s
}

func (s *Server) routes() {
	// TODO: register api.TokenHandler, api.IntrospectHandler,
	//       api.JWKSHandler, api.DiscoveryHandler.
	s.mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
}

// ListenAndServe starts the server (HTTP/2 over TLS terminated by Envoy).
func (s *Server) ListenAndServe() error { return s.srv.ListenAndServe() }

// Shutdown gracefully stops the server.
func (s *Server) Shutdown(ctx context.Context) error { return s.srv.Shutdown(ctx) }
