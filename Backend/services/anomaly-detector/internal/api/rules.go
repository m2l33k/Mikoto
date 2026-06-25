package api

import "net/http"

func (s *Server) listRules(w http.ResponseWriter, r *http.Request) {
	// TODO: return active rule definitions. GET /api/v1/rules
	http.Error(w, "not implemented", http.StatusNotImplemented)
}

func (s *Server) upsertRule(w http.ResponseWriter, r *http.Request) {
	// TODO: create/update a rule. POST /api/v1/rules
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
