// Package types5g holds shared 3GPP type definitions imported across services.
// NOTE: the Go package identifier cannot start with a digit, so the import path
// is github.com/securecode5g/5g-types while the package name is types5g.
package types5g

// NFType is a 3GPP Network Function type (TS 29.510).
type NFType string

const (
	NFTypeAMF NFType = "AMF"
	NFTypeSMF NFType = "SMF"
	NFTypeUPF NFType = "UPF"
	NFTypeAUSF NFType = "AUSF"
	NFTypeUDM NFType = "UDM"
	NFTypeUDR NFType = "UDR"
	NFTypeNRF NFType = "NRF"
)

// NFStatus reflects NF registration state in the NRF.
type NFStatus string

const (
	NFStatusRegistered   NFStatus = "REGISTERED"
	NFStatusSuspended    NFStatus = "SUSPENDED"
	NFStatusDeregistered NFStatus = "DEREGISTERED"
)

// PLMN identifies a Public Land Mobile Network.
type PLMN struct {
	MCC string `json:"mcc"`
	MNC string `json:"mnc"`
}

// SNSSAI is a Single Network Slice Selection Assistance Information value.
type SNSSAI struct {
	SST int    `json:"sst"`
	SD  string `json:"sd,omitempty"`
}

// NFProfile is a minimal NF registration profile as returned by the NRF.
type NFProfile struct {
	NFInstanceID string   `json:"nfInstanceId"`
	NFType       NFType   `json:"nfType"`
	NFStatus     NFStatus `json:"nfStatus"`
	PLMNList     []PLMN   `json:"plmnList,omitempty"`
	SNssais      []SNSSAI `json:"sNssais,omitempty"`
}
