package auth

import (
	"context"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2" // TODO: add to go.mod
)

// Casdoor wraps the Casdoor OIDC provider for management-plane human auth.
type Casdoor struct {
	provider *oidc.Provider
	verifier *oidc.IDTokenVerifier
	oauth    oauth2.Config
}

// NewCasdoor discovers the Casdoor OIDC provider and builds a verifier.
func NewCasdoor(ctx context.Context, issuer, clientID, secret, redirectURL string) (*Casdoor, error) {
	provider, err := oidc.NewProvider(ctx, issuer)
	if err != nil {
		return nil, err
	}
	return &Casdoor{
		provider: provider,
		verifier: provider.Verifier(&oidc.Config{ClientID: clientID}),
		oauth: oauth2.Config{
			ClientID:     clientID,
			ClientSecret: secret,
			Endpoint:     provider.Endpoint(),
			RedirectURL:  redirectURL,
			Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
		},
	}, nil
}

// Verify validates a raw ID token and returns its claims.
func (c *Casdoor) Verify(ctx context.Context, raw string) (*oidc.IDToken, error) {
	return c.verifier.Verify(ctx, raw)
}

// AuthCodeURL builds the login redirect URL for the given state.
func (c *Casdoor) AuthCodeURL(state string) string { return c.oauth.AuthCodeURL(state) }

// Exchange swaps an auth code for tokens.
func (c *Casdoor) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return c.oauth.Exchange(ctx, code)
}
