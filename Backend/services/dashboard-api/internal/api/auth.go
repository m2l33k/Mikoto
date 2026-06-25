package api

import "net/http"

// authCallback handles the OIDC authorization-code exchange.
// GET /auth/callback
func (s *Server) authCallback(w http.ResponseWriter, r *http.Request) {
	// TODO: validate state, casdoor.Exchange(code), verify id_token,
	//       create a session, set cookie, redirect to the UI.
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
