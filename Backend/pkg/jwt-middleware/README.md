# jwt-middleware

Standalone Go middleware for **3GPP NF-to-NF JWT validation**. Any Go-based 5G core
can import this without depending on the rest of SecureCore5G.

```go
import jwtmw "github.com/securecode5g/jwt-middleware"

mux.Handle("/namf-comm/", jwtmw.Validate(
    jwtmw.WithJWKSURL("https://nrf-oauth2:8080/oauth2/jwks"),
    jwtmw.WithRequiredScope("namf-comm"),
)(amfHandler))
```

## Features

- JWKS-backed signature verification with key caching (`WithJWKSTTL`)
- Configurable clock skew (`WithClockSkew`)
- Per-route required scopes (`WithRequiredScope`)
- Typed errors: `ErrMissingToken`, `ErrExpiredToken`, `ErrInsufficientScope`, …

## Claims

Validated tokens carry `NF5GTokenClaims` (nfType, nfInstanceId, allowedServices,
plmn, snssaiList). Retrieve them downstream with `jwtmw.ClaimsFromContext(ctx)`.

> Status: scaffold. `validator.go` JWKS fetch/cache is stubbed (`TODO`).
