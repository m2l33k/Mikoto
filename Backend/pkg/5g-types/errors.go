package types5g

// ProblemDetails is the standard 5G SBI error response body (RFC 7807 / TS 29.500).
type ProblemDetails struct {
	Type          string         `json:"type,omitempty"`
	Title         string         `json:"title,omitempty"`
	Status        int            `json:"status,omitempty"`
	Detail        string         `json:"detail,omitempty"`
	Instance      string         `json:"instance,omitempty"`
	Cause         string         `json:"cause,omitempty"`
	InvalidParams []InvalidParam `json:"invalidParams,omitempty"`
}

// InvalidParam describes a single offending request parameter.
type InvalidParam struct {
	Param  string `json:"param"`
	Reason string `json:"reason,omitempty"`
}

// Common SBI cause values.
const (
	CauseNFInstanceNotFound = "NF_INSTANCE_NOT_FOUND"
	CauseTokenExpired       = "TOKEN_EXPIRED"
	CauseInsufficientScope  = "INSUFFICIENT_SCOPE"
	CauseUnauthorized       = "UNAUTHORIZED_CLIENT"
)
