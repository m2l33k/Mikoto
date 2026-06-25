package api

import "net/http"

// listScenarios returns the catalog of available scenarios.
// GET /api/v1/scenarios
func (s *Server) listScenarios(w http.ResponseWriter, r *http.Request) {
	// TODO: walk ScenariosDir, parse headers, return [{id,name,category}].
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
