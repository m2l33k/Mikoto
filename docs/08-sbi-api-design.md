# 08 — SBI API Design

The Service-Based Interface is how control-plane NFs talk. This document defines the
conventions and the concrete endpoints you implement.

## 1. Conventions (apply to every NF)

| Aspect | Rule |
|--------|------|
| Transport | HTTP/2 (h2c for dev, TLS for "prod") |
| Payload | JSON (3GPP uses OpenAPI-defined schemas) |
| Base path | `/{service}/{version}/...` e.g. `/nnrf-nfm/v1/...` |
| Versioning | `v1` in the path |
| Errors | RFC 7807 `ProblemDetails` JSON body + proper status code |
| IDs | UUID v4 for `nfInstanceId`, context refs |
| Content negotiation | `Content-Type: application/json`; multipart for NAS containers |
| Idempotency | `PUT` for create-or-replace where 3GPP specifies it |

### ProblemDetails error body
```json
{
  "type": "https://example.com/errors/not-found",
  "title": "Subscriber not found",
  "status": 404,
  "detail": "No subscriber with SUPI imsi-208930000000001",
  "cause": "USER_NOT_FOUND"
}
```

## 2. Endpoint catalogue (MVP)

### NRF — `Nnrf`
| Method | Path | Body in / out |
|--------|------|---------------|
| PUT | `/nnrf-nfm/v1/nf-instances/{id}` | NFProfile / NFProfile |
| PATCH | `/nnrf-nfm/v1/nf-instances/{id}` | JSON Patch / 204 |
| DELETE | `/nnrf-nfm/v1/nf-instances/{id}` | – / 204 |
| GET | `/nnrf-disc/v1/nf-instances` | query / SearchResult |

### AMF — `Namf`
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/namf-comm/v1/ue-contexts/{id}/n1-n2-messages` | SMF→AMF N1/N2 transfer |

### AUSF — `Nausf`
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/nausf-auth/v1/ue-authentications` | start auth |
| PUT | `/nausf-auth/v1/ue-authentications/{id}/5g-aka-confirmation` | confirm RES* |

### UDM — `Nudm`
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/nudm-ueau/v1/{supiOrSuci}/security-information/generate-auth-data` | auth vector |
| GET | `/nudm-sdm/v1/{supi}/am-data` | AM subscription |
| GET | `/nudm-sdm/v1/{supi}/sm-data` | SM subscription |
| PUT | `/nudm-uecm/v1/{supi}/registrations/amf-3gpp-access` | record serving AMF |

### SMF — `Nsmf`
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/nsmf-pdusession/v1/sm-contexts` | create PDU session context |
| POST | `/nsmf-pdusession/v1/sm-contexts/{id}/modify` | modify (gNB tunnel) |
| POST | `/nsmf-pdusession/v1/sm-contexts/{id}/release` | release |

## 3. Example request/response

### Create SM context (AMF → SMF)
```http
POST /nsmf-pdusession/v1/sm-contexts HTTP/2
Content-Type: application/json

{
  "supi": "imsi-208930000000001",
  "pduSessionId": 1,
  "dnn": "internet",
  "sNssai": { "sst": 1, "sd": "010203" },
  "anType": "3GPP_ACCESS",
  "servingNfId": "amf-uuid",
  "n1SmMsg": { "contentId": "5gnas-sm" }
}
```
```http
HTTP/2 201 Created
Location: /nsmf-pdusession/v1/sm-contexts/abc123
Content-Type: application/json

{
  "pduSessionId": 1,
  "ueIpv4Address": "10.60.0.1",
  "n2SmInfo": { "contentId": "ngap-pdu-session-setup" }
}
```

## 4. The shared SBI client (in `common/`)

Wrap discovery + call so NFs never hard-code peer URLs:
```go
// pseudocode
type SbiClient struct{ nrfURL string }

func (c *SbiClient) Discover(targetType string) (string, error) {
    // GET nrf /nnrf-disc/v1/nf-instances?target-nf-type=...
    // return the first instance's base URL
}

func (c *SbiClient) Call(targetType, method, path string, body any) (*http.Response, error) {
    base, _ := c.Discover(targetType)
    // do HTTP/2 request to base+path, with retry + ProblemDetails parsing
}
```

## 5. Tips

- Build with **Gin** for fast routing, or stdlib `net/http` for fewer deps.
- For dev, use **h2c** (HTTP/2 cleartext) to avoid TLS friction; add TLS in M7.
- Where 3GPP sends **NAS/NGAP binary inside SBI**, use `multipart/related` with a
  JSON part + a binary part (`contentId` references).
- Keep OpenAPI YAML for each service in `docs/api/` and generate models if you like.

## Next
→ [09 — Data Model](09-data-model.md)
