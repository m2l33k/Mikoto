package token

import (
	"crypto"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Issuer mints signed JWT access tokens with 3GPP claims.
type Issuer struct {
	issuer     string
	ttl        time.Duration
	signingKey crypto.PrivateKey
	kid        string
}

// NewIssuer builds an Issuer from a private signing key and key id.
func NewIssuer(issuer string, ttl time.Duration, key crypto.PrivateKey, kid string) *Issuer {
	return &Issuer{issuer: issuer, ttl: ttl, signingKey: key, kid: kid}
}

// IssueRequest describes a token to mint for a registered NF instance.
type IssueRequest struct {
	NFInstanceID    string
	NFType          string
	AllowedNFType   string
	AllowedServices []string
	PLMN            PLMN
	SNssaiList      []SNSSAI
}

// Issue mints and signs a token for the given request.
func (i *Issuer) Issue(req IssueRequest) (string, error) {
	now := time.Now()
	claims := NF5GTokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    i.issuer,
			Subject:   req.NFInstanceID,
			Audience:  jwt.ClaimStrings{req.AllowedNFType},
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(i.ttl)),
		},
		NFType:          req.NFType,
		NFInstanceID:    req.NFInstanceID,
		AllowedNFType:   req.AllowedNFType,
		AllowedServices: req.AllowedServices,
		PLMN:            req.PLMN,
		SNssaiList:      req.SNssaiList,
	}
	t := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	t.Header["kid"] = i.kid
	return t.SignedString(i.signingKey)
}
