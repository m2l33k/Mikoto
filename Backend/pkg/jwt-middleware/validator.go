package jwtmw

import (
	"context"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Validator verifies NF5GTokenClaims against a JWKS-backed key set with caching.
type Validator struct {
	opts Options

	mu        sync.RWMutex
	keys      map[string]any // kid -> public key
	fetchedAt time.Time
}

// NewValidator builds a validator from the given options.
func NewValidator(opts ...Option) *Validator {
	o := defaultOptions()
	for _, fn := range opts {
		fn(&o)
	}
	return &Validator{opts: o, keys: map[string]any{}}
}

// Validate parses and verifies a raw bearer token, returning its claims.
func (v *Validator) Validate(ctx context.Context, raw string) (*NF5GTokenClaims, error) {
	if raw == "" {
		return nil, ErrMissingToken
	}

	claims := &NF5GTokenClaims{}
	_, err := jwt.ParseWithClaims(raw, claims, v.keyFunc(ctx),
		jwt.WithLeeway(v.opts.ClockSkew),
	)
	if err != nil {
		return nil, mapParseError(err)
	}

	for _, scope := range v.opts.RequiredScopes {
		if !claims.HasScope(scope) {
			return nil, ErrInsufficientScope
		}
	}
	return claims, nil
}

// keyFunc resolves the signing key for a token, refreshing the JWKS cache as needed.
func (v *Validator) keyFunc(ctx context.Context) jwt.Keyfunc {
	return func(t *jwt.Token) (any, error) {
		// TODO: fetch JWKS from v.opts.JWKSURL, honour v.opts.JWKSTTL, look up by kid.
		_ = ctx
		return nil, ErrJWKSUnavailable
	}
}

// refreshJWKS fetches and caches signing keys from the JWKS endpoint.
func (v *Validator) refreshJWKS(ctx context.Context) error {
	// TODO: HTTP GET v.opts.JWKSURL, decode JWK set, populate v.keys, set fetchedAt.
	_ = ctx
	return ErrJWKSUnavailable
}

func mapParseError(err error) error {
	switch {
	case err == nil:
		return nil
	case jwtErrIs(err, jwt.ErrTokenExpired):
		return ErrExpiredToken
	case jwtErrIs(err, jwt.ErrTokenSignatureInvalid):
		return ErrInvalidSignature
	case jwtErrIs(err, jwt.ErrTokenMalformed):
		return ErrMalformedToken
	default:
		return err
	}
}

func jwtErrIs(err, target error) bool {
	type iser interface{ Is(error) bool }
	if x, ok := err.(iser); ok {
		return x.Is(target)
	}
	return err == target
}
