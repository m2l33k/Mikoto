package token

import (
	"crypto"
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

// ErrInsufficientScope is returned when a token lacks a required service scope.
var ErrInsufficientScope = errors.New("token: insufficient scope")

// Validator verifies signature and scope of issued tokens (used by introspect).
type Validator struct {
	publicKey crypto.PublicKey
}

// NewValidator builds a Validator from the public half of the signing key.
func NewValidator(pub crypto.PublicKey) *Validator { return &Validator{publicKey: pub} }

// Validate parses and verifies a token, optionally enforcing required scopes.
func (v *Validator) Validate(raw string, requiredScopes ...string) (*NF5GTokenClaims, error) {
	claims := &NF5GTokenClaims{}
	_, err := jwt.ParseWithClaims(raw, claims, func(*jwt.Token) (any, error) {
		return v.publicKey, nil
	})
	if err != nil {
		return nil, err
	}
	for _, want := range requiredScopes {
		if !contains(claims.AllowedServices, want) {
			return nil, ErrInsufficientScope
		}
	}
	return claims, nil
}

func contains(xs []string, x string) bool {
	for _, v := range xs {
		if v == x {
			return true
		}
	}
	return false
}
