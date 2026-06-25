package jwtmw

import "errors"

// Typed validation errors returned by the middleware.
var (
	ErrMissingToken     = errors.New("jwtmw: missing bearer token")
	ErrMalformedToken   = errors.New("jwtmw: malformed token")
	ErrExpiredToken     = errors.New("jwtmw: token expired")
	ErrInvalidSignature = errors.New("jwtmw: invalid signature")
	ErrInsufficientScope = errors.New("jwtmw: insufficient scope")
	ErrJWKSUnavailable  = errors.New("jwtmw: JWKS endpoint unavailable")
)
