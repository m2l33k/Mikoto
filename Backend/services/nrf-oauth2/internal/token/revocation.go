package token

import "context"

// RevocationStore tracks revoked token IDs, backed by MongoDB.
type RevocationStore struct {
	// TODO: *mongo.Collection
}

// NewRevocationStore connects to MongoDB and returns a store.
func NewRevocationStore(ctx context.Context, uri string) (*RevocationStore, error) {
	// TODO: connect via go.mongodb.org/mongo-driver, ensure TTL index on exp.
	_ = ctx
	_ = uri
	return &RevocationStore{}, nil
}

// Revoke marks a token (by jti) as revoked.
func (s *RevocationStore) Revoke(ctx context.Context, jti string) error {
	// TODO: insert {jti, revokedAt}.
	_, _ = ctx, jti
	return nil
}

// IsRevoked reports whether a token id has been revoked.
func (s *RevocationStore) IsRevoked(ctx context.Context, jti string) (bool, error) {
	// TODO: lookup by jti.
	_, _ = ctx, jti
	return false, nil
}
