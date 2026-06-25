package jwtmw

import "github.com/golang-jwt/jwt/v5"

// PLMN is mirrored locally so this package stays dependency-free of 5g-types,
// keeping it independently publishable.
type PLMN struct {
	MCC string `json:"mcc"`
	MNC string `json:"mnc"`
}

// SNSSAI mirrors the 3GPP slice identifier.
type SNSSAI struct {
	SST int    `json:"sst"`
	SD  string `json:"sd,omitempty"`
}

// NF5GTokenClaims is the 3GPP-specific JWT claim set (mirrored from nrf-oauth2).
type NF5GTokenClaims struct {
	jwt.RegisteredClaims
	NFType          string   `json:"nfType"`
	NFInstanceID    string   `json:"nfInstanceId"`
	AllowedNFType   string   `json:"allowedNfType"`
	AllowedServices []string `json:"allowedServices"`
	PLMN            PLMN     `json:"plmn"`
	SNssaiList      []SNSSAI `json:"snssaiList,omitempty"`
}

// HasScope reports whether the token grants access to the given service name.
func (c *NF5GTokenClaims) HasScope(service string) bool {
	for _, s := range c.AllowedServices {
		if s == service {
			return true
		}
	}
	return false
}
