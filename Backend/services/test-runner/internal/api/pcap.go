package api

import "net/http"

// getPcap streams the pcap evidence for a run's test case.
// GET /api/v1/runs/{id}/pcap/{tc}
func (s *Server) getPcap(w http.ResponseWriter, r *http.Request) {
	// TODO: resolve {id}/{tc}.pcap, http.ServeFile with octet-stream.
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
