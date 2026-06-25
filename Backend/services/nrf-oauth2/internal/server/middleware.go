package server

import (
	"log"
	"net/http"
	"time"
)

// Middleware decorates an http.Handler.
type Middleware func(http.Handler) http.Handler

// Chain applies middlewares in order (first listed is outermost).
func Chain(h http.Handler, mws ...Middleware) http.Handler {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}

// Logging logs method, path and latency for each request.
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

// RateLimit is a placeholder token-bucket limiter keyed by client cert CN.
func RateLimit(next http.Handler) http.Handler {
	// TODO: per-CN token bucket; reject with 429 on exhaustion.
	return next
}
