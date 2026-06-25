package api

import "net/http"

// certs returns NF certificate expiry status. GET /api/v1/certs
func (s *Server) certs(w http.ResponseWriter, r *http.Request) {
	// TODO: certs.Reader.Statuses(ctx), JSON-encode.
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
