# 07 — Call Flows

The signalling sequences you must implement, in the order the roadmap builds them.
Implement them incrementally — each flow is a milestone.

---

## 1. NF registration & discovery (M1)

```mermaid
sequenceDiagram
    participant NF as Any NF (e.g. SMF)
    participant NRF
    participant AMF
    NF->>NRF: PUT /nf-instances/{id} (NFProfile)
    NRF-->>NF: 201 Created
    loop every heartBeatTimer
        NF->>NRF: PATCH /nf-instances/{id} (heartbeat)
        NRF-->>NF: 204
    end
    AMF->>NRF: GET /nf-instances?target-nf-type=SMF
    NRF-->>AMF: [SMF profile @ ip:port]
    AMF->>SMF: subsequent SBI call to discovered URL
```

**Implement:** register on startup, heartbeat loop, discovery query, deregister on
shutdown.

---

## 2. gNB attach — NG Setup (M2)

```mermaid
sequenceDiagram
    participant gNB
    participant AMF
    gNB->>AMF: SCTP association established
    gNB->>AMF: NGAP NG Setup Request (PLMN, gNB id, TAC)
    AMF->>AMF: validate PLMN support
    AMF-->>gNB: NGAP NG Setup Response (AMF name, PLMN, GUAMI)
```

**Implement:** SCTP listener, NGAP decode, PLMN check, NG Setup Response.

---

## 3. UE registration + 5G-AKA authentication (M2→M3)

```mermaid
sequenceDiagram
    participant UE
    participant gNB
    participant AMF
    participant AUSF
    participant UDM

    UE->>gNB: RRC: Registration Request (NAS, SUCI)
    gNB->>AMF: NGAP Initial UE Message (NAS)
    AMF->>AUSF: POST ue-authentications (SUCI, snn)
    AUSF->>UDM: generate-auth-data (SUCI)
    UDM-->>AUSF: AV (RAND, AUTN, XRES*, KAUSF)
    AUSF-->>AMF: 5G-AKA (RAND, AUTN, HXRES*)
    AMF->>UE: NAS Authentication Request (RAND, AUTN)
    UE-->>AMF: NAS Authentication Response (RES*)
    AMF->>AUSF: PUT 5g-aka-confirmation (RES*)
    AUSF->>AUSF: verify RES* == XRES*
    AUSF-->>AMF: SUCCESS (KSEAF)
    AMF->>UE: NAS Security Mode Command
    UE-->>AMF: NAS Security Mode Complete
    AMF->>UDM: UECM register (serving AMF)
    AMF->>UDM: get am-data (subscription)
    AMF->>UE: NAS Registration Accept (GUTI)
    UE-->>AMF: NAS Registration Complete
```

**Implement (M2):** up to Authentication Request being sent.
**Implement (M3):** full exchange to **Registration Complete**.

---

## 4. PDU session establishment (M4 control, M5 data)

```mermaid
sequenceDiagram
    participant UE
    participant gNB
    participant AMF
    participant SMF
    participant UDM
    participant UPF

    UE->>AMF: NAS PDU Session Establishment Request (DNN, S-NSSAI, PDU id)
    AMF->>SMF: POST sm-contexts (supi, dnn, snssai, NAS-SM)
    SMF->>UDM: get sm-data (verify DNN/slice)
    UDM-->>SMF: subscription OK
    SMF->>SMF: allocate UE IP; select UPF
    SMF->>UPF: PFCP Session Establishment (uplink PDR/FAR)
    UPF-->>SMF: accepted (UPF N3 TEID/IP)
    SMF-->>AMF: 201 + NAS PDU Session Accept (UE IP) + N2 info
    AMF->>gNB: NGAP PDU Session Resource Setup (UPF TEID)
    gNB-->>AMF: PDU Session Resource Setup Response (gNB TEID)
    AMF->>SMF: POST sm-contexts/{id}/modify (gNB TEID)
    SMF->>UPF: PFCP Modify (downlink FAR → gNB)
    UPF-->>SMF: ok
    Note over UE,UPF: Data plane now active (GTP-U)
```

**Implement (M4):** everything except real PFCP (UPF returns stub success; UE gets IP).
**Implement (M5):** real PFCP + gtp5g; data actually flows.

---

## 5. User-plane data path (M5)

```mermaid
sequenceDiagram
    participant UE
    participant gNB
    participant UPF
    participant DN as Internet
    UE->>gNB: IP packet (e.g. ping 8.8.8.8)
    gNB->>UPF: GTP-U encapsulated (N3, uplink TEID)
    UPF->>UPF: gtp5g: match PDR → FAR → decap → NAT
    UPF->>DN: IP packet (N6)
    DN-->>UPF: reply
    UPF->>UPF: gtp5g: match UE IP → encap (downlink TEID)
    UPF-->>gNB: GTP-U (N3)
    gNB-->>UE: IP reply
```

---

## 6. Deregistration / release (M7 stretch)

```mermaid
sequenceDiagram
    participant UE
    participant AMF
    participant SMF
    participant UPF
    UE->>AMF: NAS Deregistration Request
    AMF->>SMF: release sm-contexts
    SMF->>UPF: PFCP Session Deletion
    UPF-->>SMF: ok (rules removed)
    AMF-->>UE: NAS Deregistration Accept
    AMF->>AMF: release UE context
```

---

## Verification tip
For **every** flow, capture it with Wireshark and save the `.pcap` next to the
milestone notes. Wireshark decodes NGAP, NAS, PFCP, and GTP natively — it is your
single best debugging tool. Compare your messages against a reference trace from a
known-good core.

## Next
→ [08 — SBI API Design](08-sbi-api-design.md)
