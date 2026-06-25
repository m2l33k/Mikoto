package vault

import (
	"context"
	"crypto"
)

// Client fetches the JWT signing key from Vault KV v2.
type Client struct {
	addr string
	// TODO: *vaultapi.Client
}

// NewClient builds a Vault client for the given address.
func NewClient(addr string) (*Client, error) {
	// TODO: vaultapi.NewClient with token from env / Kubernetes auth.
	return &Client{addr: addr}, nil
}

// SigningKey reads the RS256 private key (and its kid) from the given KV path.
func (c *Client) SigningKey(ctx context.Context, path string) (key crypto.PrivateKey, kid string, err error) {
	// TODO: KVv2.Get(path), PEM-decode "private_key", read "kid".
	_, _ = ctx, path
	return nil, "", nil
}
