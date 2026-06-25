package jwtmw

import "testing"

func TestHasScope(t *testing.T) {
	c := &NF5GTokenClaims{AllowedServices: []string{"namf-comm", "nsmf-pdusession"}}
	if !c.HasScope("namf-comm") {
		t.Fatal("expected scope namf-comm to be granted")
	}
	if c.HasScope("nudm-sdm") {
		t.Fatal("did not expect scope nudm-sdm")
	}
}

func TestValidateMissingToken(t *testing.T) {
	v := NewValidator(WithJWKSURL("http://localhost/jwks"))
	if _, err := v.Validate(nil, ""); err != ErrMissingToken {
		t.Fatalf("want ErrMissingToken, got %v", err)
	}
}
