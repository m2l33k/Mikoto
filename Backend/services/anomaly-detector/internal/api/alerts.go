package api

import "net/http"

func (s *Server) listAlerts(w http.ResponseWriter, r *http.Request) {
	// TODO: store.List, JSON-encode. GET /api/v1/alerts
	http.Error(w, "not implemented", http.StatusNotImplemented)
}

func (s *Server) getAlert(w http.ResponseWriter, r *http.Request) {
	// TODO: store.Get(r.PathValue("id")). GET /api/v1/alerts/{id}
	http.Error(w, "not implemented", http.StatusNotImplemented)
}

func (s *Server) ackAlert(w http.ResponseWriter, r *http.Request) {
	// TODO: store.Ack(r.PathValue("id")). POST /api/v1/alerts/{id}/ack
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
