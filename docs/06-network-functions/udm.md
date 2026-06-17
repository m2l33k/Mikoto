# UDM — Unified Data Management

## Responsibility
Owns **subscriber identity and data**: the permanent key K, the authentication
method, subscription profiles (allowed slices, DNNs), and session management
subscription data. Generates **authentication vectors** for the AUSF.

In a full core, UDM is stateless and reads from a separate **UDR** database. For the
MVP you may merge UDM+UDR and read directly from MongoDB.

## Interfaces
| Peer | Direction | Transport | Reference point |
|------|-----------|-----------|-----------------|
| AUSF | inbound | SBI HTTP/2 | N13 |
| AMF | inbound | SBI HTTP/2 | N8 |
| SMF | inbound | SBI HTTP/2 | — |
| MongoDB | outbound | driver | subscriber store |
| NRF | outbound | SBI HTTP/2 | register/discover |

## Services exposed
### `Nudm_UEAuthentication`
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/nudm-ueau/v1/{supiOrSuci}/security-information/generate-auth-data` | Build the 5G-AKA vector |

### `Nudm_SDM` (Subscriber Data Management)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/nudm-sdm/v1/{supi}/am-data` | Access & mobility subscription |
| GET | `/nudm-sdm/v1/{supi}/sm-data` | Session management subscription (DNN, slice) |

### `Nudm_UECM` (UE Context Management)
| Method | Path | Purpose |
|--------|------|---------|
| PUT | `/nudm-uecm/v1/{supi}/registrations/amf-3gpp-access` | Record the serving AMF |

## Services consumed
- MongoDB queries for subscriber documents (or UDR if you split it).

## Internal logic — auth vector generation
```mermaid
sequenceDiagram
    participant AUSF
    participant UDM
    participant DB as MongoDB
    AUSF->>UDM: generate-auth-data (SUCI/SUPI)
    UDM->>UDM: de-conceal SUCI → SUPI (if needed)
    UDM->>DB: fetch K, OPc, SQN, auth method
    DB-->>UDM: subscriber security data
    UDM->>UDM: MILENAGE(K,OPc,RAND) → RAND,AUTN,XRES,CK,IK
    UDM->>UDM: derive KAUSF; build 5G HE AV
    UDM-->>AUSF: authentication vector
```

## Subscriber document (MongoDB)
See full schema in [../09-data-model.md](../09-data-model.md). Essentials:
```json
{
  "supi": "imsi-208930000000001",
  "authenticationMethod": "5G_AKA",
  "permanentKey": "8baf473f2f8fd09487cccbd7097c6862",
  "opc": "8e27b6af0e692e750f32667a3b14605d",
  "sqn": "000000000023",
  "subscribedDnnList": ["internet"],
  "subscribedSnssaiList": [{"sst": 1, "sd": "010203"}]
}
```

## Build checklist
1. [ ] Register with NRF; connect to MongoDB.
2. [ ] `generate-auth-data`: load K/OPc, run MILENAGE (library), build AV.
3. [ ] Maintain `SQN` (sequence number) per subscriber; handle re-sync.
4. [ ] `am-data` and `sm-data` GET handlers from the subscriber doc.
5. [ ] `UECM` registration to record the serving AMF.
6. [ ] `/metrics`: auth-data requests, unknown-SUPI errors.
7. [ ] Provisioning helper/script to insert test subscribers.

## Demo (M3)
Insert a subscriber; AUSF requests a vector; UDM returns it; auth succeeds.
