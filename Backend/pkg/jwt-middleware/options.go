package jwtmw

import "time"

// Options holds the configurable behaviour of the validator/middleware.
type Options struct {
	JWKSURL        string
	JWKSTTL        time.Duration
	ClockSkew      time.Duration
	RequiredScopes []string
}

// Option is a functional option mutating Options.
type Option func(*Options)

func defaultOptions() Options {
	return Options{
		JWKSTTL:   10 * time.Minute,
		ClockSkew: 30 * time.Second,
	}
}

// WithJWKSURL sets the JWKS endpoint used to fetch signing keys.
func WithJWKSURL(url string) Option { return func(o *Options) { o.JWKSURL = url } }

// WithJWKSTTL sets how long fetched keys are cached.
func WithJWKSTTL(d time.Duration) Option { return func(o *Options) { o.JWKSTTL = d } }

// WithClockSkew sets the tolerated clock skew on exp/nbf validation.
func WithClockSkew(d time.Duration) Option { return func(o *Options) { o.ClockSkew = d } }

// WithRequiredScope requires the token to grant the given service scope.
func WithRequiredScope(scope string) Option {
	return func(o *Options) { o.RequiredScopes = append(o.RequiredScopes, scope) }
}
