# 09 — Data Model

The shared schemas. Put the Go structs in `common/models/` so every NF uses the
same definitions.

## 1. NFProfile (NRF registry entry)
```jsonc
{
  "nfInstanceId": "9d3f...uuid",
  "nfType": "AMF",              // NRF, AMF, SMF, UPF, AUSF, UDM
  "nfStatus": "REGISTERED",     // REGISTERED | SUSPENDED | DEREGISTERED
  "plmnList": [{ "mcc": "208", "mnc": "93" }],
  "ipv4Addresses": ["10.0.0.10"],
  "nfServices": [
    {
      "serviceInstanceId": "namf-comm-1",
      "serviceName": "namf-comm",
      "versions": [{ "apiVersionInUri": "v1" }],
      "scheme": "http",
      "ipEndPoints": [{ "ipv4Address": "10.0.0.10", "port": 8000 }]
    }
  ],
  "heartBeatTimer": 10,
  "nfServicePersistence": false
}
```

## 2. Subscriber (MongoDB, owned by UDM/UDR)
```jsonc
{
  "supi": "imsi-208930000000001",
  "plmnId": { "mcc": "208", "mnc": "93" },

  // --- authentication (UDM auth data) ---
  "authenticationMethod": "5G_AKA",       // or EAP-AKA'
  "permanentKey": "8baf473f2f8fd09487cccbd7097c6862",  // K (hex)
  "opc": "8e27b6af0e692e750f32667a3b14605d",
  "sqn": "000000000020",                  // sequence number, updated each auth
  "authenticationManagementField": "8000",

  // --- access & mobility subscription (am-data) ---
  "subscribedUeAmbr": { "uplink": "1 Gbps", "downlink": "2 Gbps" },
  "nssai": { "defaultSingleNssais": [{ "sst": 1, "sd": "010203" }] },

  // --- session management subscription (sm-data) ---
  "subscribedDnnList": ["internet"],
  "dnnConfigurations": {
    "internet": {
      "pduSessionTypes": { "defaultSessionType": "IPV4" },
      "sscModes": { "defaultSscMode": "SSC_MODE_1" },
      "5gQosProfile": { "5qi": 9, "arp": { "priorityLevel": 8 } },
      "sessionAmbr": { "uplink": "200 Mbps", "downlink": "400 Mbps" }
    }
  }
}
```

## 3. UE context (in-memory, AMF)
```jsonc
{
  "supi": "imsi-208930000000001",
  "guti": "208930000...",
  "amfUeNgapId": 1,
  "ranUeNgapId": 1,
  "ratType": "NR",
  "registrationState": "REGISTERED",      // DEREGISTERED|AUTHENTICATING|REGISTERED
  "cmState": "CONNECTED",                 // IDLE | CONNECTED
  "securityContext": {
    "ngksi": 0, "kAmf": "…", "kNasInt": "…", "kNasEnc": "…",
    "selectedIntAlg": "NIA2", "selectedEncAlg": "NEA0"
  },
  "pduSessions": { "1": "smContextRef-abc123" }
}
```

## 4. SM context (in-memory, SMF)
```jsonc
{
  "smContextRef": "abc123",
  "supi": "imsi-208930000000001",
  "pduSessionId": 1,
  "dnn": "internet",
  "sNssai": { "sst": 1, "sd": "010203" },
  "pduSessionType": "IPV4",
  "ueIpv4Address": "10.60.0.1",
  "selectedUpf": "upf-1",
  "upfN3": { "teid": "0x00000001", "ipv4": "10.0.0.20" },
  "gnbN3": { "teid": "0x00000abc", "ipv4": "10.0.0.30" },
  "pfcpSeid": 1,
  "state": "ACTIVE"
}
```

## 5. PFCP session (in-memory, UPF)
```jsonc
{
  "seid": 1,
  "pdrs": [
    { "pdrId": 1, "direction": "uplink",   "sourceInterface": "ACCESS", "farId": 1 },
    { "pdrId": 2, "direction": "downlink", "sourceInterface": "CORE",   "farId": 2 }
  ],
  "fars": [
    { "farId": 1, "action": "FORWARD", "destInterface": "CORE" },
    { "farId": 2, "action": "FORWARD", "destInterface": "ACCESS",
      "outerHeaderCreation": { "teid": "0x00000abc", "ipv4": "10.0.0.30" } }
  ],
  "ueIp": "10.60.0.1"
}
```

## 6. IP address pool (SMF)
```text
DNN "internet" → 10.60.0.0/16
allocate: next free address; release on session delete
```

## 7. Suggested MongoDB collections
| Collection | Owner | Contents |
|------------|-------|----------|
| `subscribers` | UDM | subscriber docs (schema §2) |
| `nfInstances` (optional) | NRF | persisted NF profiles |
| `sessions` (optional) | SMF | audit of sessions |

## 8. Go modelling tip
Define these once in `common/models`, tag with `json:"…" bson:"…"`, and import
everywhere. Keep enums as typed string constants:
```go
type NfStatus string
const (
    NfStatusRegistered  NfStatus = "REGISTERED"
    NfStatusSuspended   NfStatus = "SUSPENDED"
)
```

## Next
→ [10 — Testing & Validation](10-testing-validation.md)
