package api

import "net/http"

// Shell-level endpoints (workflowbackend.md §3).

var environments = []string{
	"5G-LAB-PROD-SOUTH",
	"5G-LAB-DEV-NORTH",
	"5G-LAB-STAGING-EAST",
}

// listEnvironments returns selectable target networks. GET /api/v1/environments
func (s *Server) listEnvironments(w http.ResponseWriter, r *http.Request) {
	// TODO: read from deployment inventory instead of a static list.
	writeJSON(w, http.StatusOK, environments)
}

// switchEnvironment scopes subsequent queries. PUT /api/v1/me/environment
func (s *Server) switchEnvironment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Environment string `json:"environment"`
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	for _, e := range environments {
		if e == req.Environment {
			// TODO: persist per-operator environment selection.
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}
	writeErr(w, http.StatusBadRequest, "UNKNOWN_ENVIRONMENT", "environment not in inventory")
}

// systemStatus feeds the topbar + Overview head badges. GET /api/v1/system/status
func (s *Server) systemStatus(w http.ResponseWriter, r *http.Request) {
	// TODO: aggregate — NRF instance count, Envoy mTLS mode, Vault seal status.
	writeJSON(w, http.StatusOK, SystemStatus{
		NfRegistered: 8,
		NfExpected:   8,
		MtlsMode:     "strict-enforce",
		CoreState:    "running",
		VaultSealed:  false,
	})
}

// listNotifications returns the bell feed. GET /api/v1/notifications
func (s *Server) listNotifications(w http.ResponseWriter, r *http.Request) {
	// TODO: source from anomaly-detector + PKI expiry watcher + NRF events.
	items := []Notice{
		{ID: "n-1", Kind: "danger", Title: "IMSI Catcher signature detected (192.168.12.9)", Time: "2m"},
		{ID: "n-2", Kind: "warning", Title: "AMF certificate expires in 48h", Time: "14m"},
		{ID: "n-3", Kind: "warning", Title: "UPF-Node-01 CPU saturation 76%", Time: "23m"},
		{ID: "n-4", Kind: "info", Title: "NF registered: SMF-Node-02", Time: "31m"},
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "unread": len(items)})
}

// markNotificationsRead clears unread state. POST /api/v1/notifications/read
func (s *Server) markNotificationsRead(w http.ResponseWriter, r *http.Request) {
	var req struct {
		IDs []string `json:"ids"` // empty = all
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	// TODO: persist read markers per operator.
	w.WriteHeader(http.StatusNoContent)
}
