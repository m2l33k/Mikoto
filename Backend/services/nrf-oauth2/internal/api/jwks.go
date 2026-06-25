package api

import "net/http"

// JWKSHandler implements GET /oauth2/jwks, publishing the public signing key(s)
// so resource servers (and jwt-middleware) can verify tokens.
func JWKSHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: serialize the public key as a JWK set {keys:[{kty,n,e,kid,use,alg}]}.
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
