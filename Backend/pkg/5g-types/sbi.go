package types5g

// SBIService is a 3GPP service-based interface service name (TS 29.510 §6.1.6).
type SBIService string

const (
	SBINamfComm       SBIService = "namf-comm"
	SBINsmfPDUSession SBIService = "nsmf-pdusession"
	SBINudmSDM        SBIService = "nudm-sdm"
	SBINudmUEAU       SBIService = "nudm-ueau"
	SBINausfAuth      SBIService = "nausf-auth"
	SBINnrfNFM        SBIService = "nnrf-nfm"
	SBINnrfDisc       SBIService = "nnrf-disc"
)

// AllSBIServices lists every known service name (handy for validation).
var AllSBIServices = []SBIService{
	SBINamfComm, SBINsmfPDUSession, SBINudmSDM,
	SBINudmUEAU, SBINausfAuth, SBINnrfNFM, SBINnrfDisc,
}
