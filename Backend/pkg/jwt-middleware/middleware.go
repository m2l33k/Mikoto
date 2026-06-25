package jwtmw

import (
	"context"
	"net/http"
	"strings"
)

type ctxKey struct{}

// ClaimsFromContext returns the validated claims stored by the middleware.
func ClaimsFromContext(ctx context.Context) (*NF5GTokenClaims, bool) {
	c, ok := ctx.Value(ctxKey{}).(*NF5GTokenClaims)
	return c, ok
}

// Validate returns an HTTP middleware that enforces a valid 3GPP JWT.
//
//	mux.Handle("/namf-comm/", jwtmw.Validate(
//	    jwtmw.WithJWKSURL("https://nrf-oauth2:8080/oauth2/jwks"),
//	    jwtmw.WithRequiredScope("namf-comm"),
//	)(amfHandler))
func Validate(opts ...Option) func(http.Handler) http.Handler {
	v := NewValidator(opts...)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw := bearerToken(r)
			claims, err := v.Validate(r.Context(), raw)
			if err != nil {
				writeError(w, err)
				return
			}
			ctx := context.WithValue(r.Context(), ctxKey{}, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func bearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if !strings.HasPrefix(h, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(h, "Bearer ")
}

func writeError(w http.ResponseWriter, err error) {
	status := http.StatusUnauthorized
	if err == ErrInsufficientScope {
		status = http.StatusForbidden
	}
	w.Header().Set("WWW-Authenticate", "Bearer")
	http.Error(w, err.Error(), status)
}
