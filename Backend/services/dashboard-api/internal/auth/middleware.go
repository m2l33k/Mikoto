package auth

import (
	"context"
	"net/http"
	"strings"
)

type ctxKey struct{}

// Middleware enforces a valid Casdoor OIDC JWT on the management plane.
type Middleware struct {
	casdoor *Casdoor
}

// NewMiddleware builds auth middleware around a Casdoor verifier.
func NewMiddleware(c *Casdoor) *Middleware { return &Middleware{casdoor: c} }

// Require wraps a handler, rejecting requests without a valid token.
func (m *Middleware) Require(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		if raw == "" {
			http.Error(w, "missing token", http.StatusUnauthorized)
			return
		}
		tok, err := m.casdoor.Verify(r.Context(), raw)
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), ctxKey{}, tok)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
