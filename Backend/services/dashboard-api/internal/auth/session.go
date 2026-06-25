package auth

import "time"

// Session is a server-side management-plane session.
type Session struct {
	Subject   string
	Roles     []string
	ExpiresAt time.Time
}

// SessionStore manages issued session tokens.
type SessionStore struct {
	// TODO: backing store (in-memory or Redis).
}

// NewSessionStore builds a session store.
func NewSessionStore() *SessionStore { return &SessionStore{} }

// Create issues a new session token for a subject.
func (s *SessionStore) Create(sub string, roles []string, ttl time.Duration) (string, error) {
	// TODO: generate token, persist Session.
	_, _, _ = sub, roles, ttl
	return "", nil
}

// Lookup resolves a session token.
func (s *SessionStore) Lookup(token string) (*Session, bool) { _ = token; return nil, false }
