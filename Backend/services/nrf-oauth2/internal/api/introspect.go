package api

import "net/http"

// IntrospectHandler implements POST /oauth2/introspect (RFC 7662).
// Returns {active, scope, nfType, ...} and consults the revocation store.
func IntrospectHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: validate token signature, check revocation, return active=true/false.
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
