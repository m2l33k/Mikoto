package api

import "net/http"

// DiscoveryHandler implements GET /.well-known/openid-configuration,
// advertising token, introspection and jwks endpoints.
func DiscoveryHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: emit issuer, token_endpoint, introspection_endpoint, jwks_uri,
	//       token_endpoint_auth_methods_supported: ["tls_client_auth"].
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
