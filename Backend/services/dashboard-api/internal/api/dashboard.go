package api

import (
	"fmt"
	"net/http"
	"strconv"
)

// Overview endpoints (workflowbackend.md §4).

// dashboardKpis serves the 5-card KPI strip. GET /api/v1/dashboard/kpis
func (s *Server) dashboardKpis(w http.ResponseWriter, r *http.Request) {
	// TODO: fan out — NRF (nfsOnline), UDM (subscribers), SMF (pduSessions),
	// Vault PKI (mtls), anomaly-detector (anomalies) — then aggregate.
	var k DashboardKpis
	k.NfsOnline.Up, k.NfsOnline.Total = 8, 8
	k.Subscribers.Provisioned, k.Subscribers.RegisteredNow = 1284, 2
	k.PduSessions.Active, k.PduSessions.GtpuGbps = 2, 14.2
	k.Mtls.CoveragePct, k.Mtls.Identities = 100, 12
	k.Anomalies.Open, k.Anomalies.Critical, k.Anomalies.Warning = 1, 1, 0
	writeJSON(w, http.StatusOK, k)
}

// nfHealth serves the per-NF health grid. GET /api/v1/nf/health
func (s *Server) nfHealth(w http.ResponseWriter, r *http.Request) {
	// TODO: NRF registrations + Prometheus cpu/mem/trend per NF.
	writeJSON(w, http.StatusOK, []NfHealth{
		{Nf: "AMF", Role: "Access & Mobility", Status: "healthy", Cpu: 41, Mem: 58, Trend: []float64{38, 40, 39, 42, 41, 43, 41}},
		{Nf: "SMF", Role: "Session Mgmt", Status: "healthy", Cpu: 28, Mem: 47, Trend: []float64{26, 27, 29, 28, 30, 28, 28}},
		{Nf: "UPF", Role: "User Plane", Status: "degraded", Cpu: 76, Mem: 71, Trend: []float64{60, 64, 69, 72, 74, 75, 76}},
		{Nf: "AUSF", Role: "Authentication", Status: "healthy", Cpu: 18, Mem: 31, Trend: []float64{16, 17, 18, 17, 19, 18, 18}},
		{Nf: "UDM", Role: "Unified Data", Status: "healthy", Cpu: 22, Mem: 44, Trend: []float64{20, 21, 23, 22, 22, 23, 22}},
		{Nf: "NRF", Role: "Registry", Status: "healthy", Cpu: 12, Mem: 34, Trend: []float64{11, 12, 12, 13, 12, 12, 12}},
		{Nf: "PCF", Role: "Policy", Status: "healthy", Cpu: 9, Mem: 26, Trend: []float64{8, 9, 9, 10, 9, 9, 9}},
		{Nf: "NSSF", Role: "Slice Selection", Status: "healthy", Cpu: 7, Mem: 21, Trend: []float64{6, 7, 7, 8, 7, 7, 7}},
	})
}

// listEvents serves the recent-events table. GET /api/v1/events?limit=
func (s *Server) listEvents(w http.ResponseWriter, r *http.Request) {
	limit := 20
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	// TODO: merged feed — anomaly-detector alerts, NRF lifecycle, PKI expiry.
	events := []SystemEvent{
		{Time: "14:02:11", Severity: "critical", Source: "ML-Engine", Message: "IMSI Catcher signature detected (192.168.12.9)"},
		{Time: "13:58:40", Severity: "warning", Source: "UPF-Node-01", Message: "CPU saturation 76% sustained > 5m"},
		{Time: "13:47:02", Severity: "warning", Source: "PKI", Message: "AMF certificate expires in 48h"},
		{Time: "13:31:55", Severity: "info", Source: "NRF", Message: "NF registered: SMF-Node-02"},
	}
	if len(events) > limit {
		events = events[:limit]
	}
	writeJSON(w, http.StatusOK, events)
}

// exportDashboard streams a CSV snapshot. GET /api/v1/dashboard/export
func (s *Server) exportDashboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", `attachment; filename="overview-snapshot.csv"`)
	// TODO: render the same aggregates as dashboardKpis.
	fmt.Fprintln(w, "metric,value")
	fmt.Fprintln(w, "nfs_online,8/8")
	fmt.Fprintln(w, "subscribers_provisioned,1284")
	fmt.Fprintln(w, "pdu_sessions_active,2")
	fmt.Fprintln(w, "mtls_coverage_pct,100")
	fmt.Fprintln(w, "anomalies_open,1")
}

// ackAllAlerts acknowledges every open alert. POST /api/v1/alerts/ack-all
func (s *Server) ackAllAlerts(w http.ResponseWriter, r *http.Request) {
	// TODO: proxy bulk-ack to anomaly-detector. Requires secops-admin or
	// netops-engineer role (enforce via middleware claims).
	w.WriteHeader(http.StatusNoContent)
}

// runDiagnostics queues a core diagnostics job. POST /api/v1/diagnostics/run
func (s *Server) runDiagnostics(w http.ResponseWriter, r *http.Request) {
	// TODO: trigger test-runner smoke scenario; publish progress on SSE `events`.
	writeJSON(w, http.StatusAccepted, map[string]string{"jobId": "diag-0001"})
}
