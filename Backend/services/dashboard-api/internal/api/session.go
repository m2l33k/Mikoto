package api

import (
	"net/http"
	"strings"
	"time"
)

// Session lifecycle for the console (workflowbackend.md §2).
// TODO: replace the mock token flow with Casdoor-issued JWTs end-to-end;
// the OIDC callback in auth.go stays the browser entry point.

type loginRequest struct {
	Identity    string `json:"identity"`
	Passphrase  string `json:"passphrase"`
	Environment string `json:"environment"`
	EnforceMtls bool   `json:"enforceMtls"`
}

type loginResponse struct {
	Token     string  `json:"token"`
	ExpiresAt string  `json:"expiresAt"`
	Session   Session `json:"session"`
}

// login establishes a secure context. POST /auth/login
func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	req.Identity = strings.TrimSpace(req.Identity)
	if req.Identity == "" || !strings.Contains(req.Identity, "@") {
		writeErr(w, http.StatusBadRequest, "INVALID_IDENTITY",
			"identity must be a valid domain address (name@domain)")
		return
	}
	if len(req.Passphrase) < 6 {
		writeErr(w, http.StatusBadRequest, "WEAK_PASSPHRASE",
			"signature passphrase must be at least 6 characters")
		return
	}

	// TODO: verify credentials against Casdoor (password grant or ROPC
	// equivalent) and mint a real JWT via pkg/jwt-middleware.
	sess := Session{
		Identity:    req.Identity,
		Environment: req.Environment,
		Mtls:        req.EnforceMtls,
		Since:       time.Now().UnixMilli(),
		Role:        "secops-admin",
		DisplayName: "Malek Aziz H.",
	}
	writeJSON(w, http.StatusOK, loginResponse{
		Token:     "dev-token", // TODO: real signed JWT
		ExpiresAt: time.Now().Add(8 * time.Hour).UTC().Format(time.RFC3339),
		Session:   sess,
	})
}

// getSession returns the caller's session. GET /auth/session
func (s *Server) getSession(w http.ResponseWriter, r *http.Request) {
	// TODO: derive from the validated JWT claims (auth.Middleware context).
	writeJSON(w, http.StatusOK, Session{
		Identity:    "admin-secops@telecom.node",
		Environment: "5G-LAB-PROD-SOUTH",
		Mtls:        true,
		Since:       time.Now().Add(-42 * time.Minute).UnixMilli(),
		Role:        "secops-admin",
		DisplayName: "Malek Aziz H.",
	})
}

// logout revokes the caller's token. POST /auth/logout
func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	// TODO: add the token's jti to the revocation list until expiry.
	w.WriteHeader(http.StatusNoContent)
}

type recoverRequest struct {
	Identity     string `json:"identity"`
	PgpSignature string `json:"pgpSignature"`
}

// recoverKeys verifies a detached PGP signature and issues a recovery token.
// POST /auth/recover
func (s *Server) recoverKeys(w http.ResponseWriter, r *http.Request) {
	var req recoverRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	if !strings.Contains(req.PgpSignature, "BEGIN PGP SIGNATURE") {
		writeErr(w, http.StatusBadRequest, "INVALID_SIGNATURE",
			"a detached PGP signature block is required")
		return
	}
	// TODO: verify the signature against the operator's enrolled public key
	// (Vault kv/5gc/operator-keys) before issuing anything.
	writeJSON(w, http.StatusAccepted, map[string]string{"recoveryToken": "dev-recovery-token"})
}
