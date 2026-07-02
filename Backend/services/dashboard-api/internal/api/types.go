package api

// DTOs for the dashboard contract. Field names match the Angular frontend
// bindings exactly (see workflowbackend.md / api/openapi.yaml).

// Session is the authenticated operator context.
type Session struct {
	Identity    string `json:"identity"`
	Environment string `json:"environment"`
	Mtls        bool   `json:"mtls"`
	Since       int64  `json:"since"`
	Role        string `json:"role"`
	DisplayName string `json:"displayName"`
}

// SystemStatus feeds the shell topbar and Overview head badges.
type SystemStatus struct {
	NfRegistered int    `json:"nfRegistered"`
	NfExpected   int    `json:"nfExpected"`
	MtlsMode     string `json:"mtlsMode"`
	CoreState    string `json:"coreState"` // running | degraded | down
	VaultSealed  bool   `json:"vaultSealed"`
}

// Notice is one entry in the notification bell dropdown.
type Notice struct {
	ID    string `json:"id"`
	Kind  string `json:"kind"` // danger | warning | info
	Title string `json:"title"`
	Time  string `json:"time"`
}

// DashboardKpis is the Overview KPI strip (5 cards).
type DashboardKpis struct {
	NfsOnline struct {
		Up    int `json:"up"`
		Total int `json:"total"`
	} `json:"nfsOnline"`
	Subscribers struct {
		Provisioned   int `json:"provisioned"`
		RegisteredNow int `json:"registeredNow"`
	} `json:"subscribers"`
	PduSessions struct {
		Active   int     `json:"active"`
		GtpuGbps float64 `json:"gtpuGbps"`
	} `json:"pduSessions"`
	Mtls struct {
		CoveragePct float64 `json:"coveragePct"`
		Identities  int     `json:"identities"`
	} `json:"mtls"`
	Anomalies struct {
		Open     int `json:"open"`
		Critical int `json:"critical"`
		Warning  int `json:"warning"`
	} `json:"anomalies"`
}

// NfHealth is one tile in the Overview NF health grid.
type NfHealth struct {
	Nf     string    `json:"nf"`
	Role   string    `json:"role"`
	Status string    `json:"status"` // healthy | degraded | down
	Cpu    int       `json:"cpu"`
	Mem    int       `json:"mem"`
	Trend  []float64 `json:"trend"`
}

// SystemEvent is one row of the Overview recent-events table.
type SystemEvent struct {
	Time     string `json:"time"`
	Severity string `json:"severity"` // critical | warning | info
	Source   string `json:"source"`
	Message  string `json:"message"`
}

// ListEnvelope wraps paginated list responses (frontend TableController).
type ListEnvelope[T any] struct {
	Items    []T `json:"items"`
	Total    int `json:"total"`
	Page     int `json:"page"`
	PageSize int `json:"pageSize"`
}

// APIError is the error envelope for non-2xx responses.
type APIError struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}
