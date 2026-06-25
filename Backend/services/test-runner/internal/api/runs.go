package api

import "net/http"

// createRun starts a new test run. POST /api/v1/runs
func (s *Server) createRun(w http.ResponseWriter, r *http.Request) {
	// TODO: parse {core, scenarios[]}, launch executor, return run id (202).
	http.Error(w, "not implemented", http.StatusNotImplemented)
}

// getRun returns a run's status/report. GET /api/v1/runs/{id}
func (s *Server) getRun(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "not implemented", http.StatusNotImplemented)
}

// deleteRun cancels/removes a run. DELETE /api/v1/runs/{id}
func (s *Server) deleteRun(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "not implemented", http.StatusNotImplemented)
}
