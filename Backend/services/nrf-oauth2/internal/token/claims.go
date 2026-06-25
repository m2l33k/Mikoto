package token

import "github.com/golang-jwt/jwt/v5"

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

// NF5GTokenClaims is the 3GPP-specific JWT claim set issued by this server
// (TS 33.501 §13.3).
type NF5GTokenClaims struct {
	jwt.RegisteredClaims
	NFType          string   `json:"nfType"`
	NFInstanceID    string   `json:"nfInstanceId"`
	AllowedNFType   string   `json:"allowedNfType"`
	AllowedServices []string `json:"allowedServices"` // e.g. ["namf-comm","nsmf-pdusession"]
	PLMN            PLMN     `json:"plmn"`
	SNssaiList      []SNSSAI `json:"snssaiList,omitempty"`
}
