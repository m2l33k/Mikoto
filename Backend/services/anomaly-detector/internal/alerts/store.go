package alerts

import "context"

// Store persists alert state in Redis.
type Store struct {
	// TODO: *redis.Client
}

// NewStore connects to Redis at the given URL.
func NewStore(ctx context.Context, url string) (*Store, error) {
	// TODO: redis.ParseURL + redis.NewClient + Ping.
	_, _ = ctx, url
	return &Store{}, nil
}

// Put upserts an alert.
func (s *Store) Put(ctx context.Context, a Alert) error { _, _ = ctx, a; return nil }

// List returns recent alerts.
func (s *Store) List(ctx context.Context) ([]Alert, error) { _ = ctx; return nil, nil }

// Get returns one alert by id.
func (s *Store) Get(ctx context.Context, id string) (Alert, error) { _, _ = ctx, id; return Alert{}, nil }

// Ack marks an alert acknowledged.
func (s *Store) Ack(ctx context.Context, id string) error { _, _ = ctx, id; return nil }
