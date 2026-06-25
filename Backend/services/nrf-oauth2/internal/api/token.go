package api

import "net/http"

// TokenHandler implements POST /oauth2/token.
//
// Client identity is derived from the Envoy-terminated mTLS certificate CN
// (forwarded via x-forwarded-client-cert) — no client secret is used. The NF
// instance is verified against the NRF before any token is minted.
func TokenHandler(w http.ResponseWriter, r *http.Request) {
	// TODO:
	//  1. Extract NF identity from XFCC header (set by Envoy).
	//  2. nrf.Client.VerifyRegistered(nfInstanceId).
	//  3. Resolve allowedServices for the requested target NF type.
	//  4. token.Issuer.Issue(...) and return RFC 6749 token response.
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
