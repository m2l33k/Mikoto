# 17 — Deliverables & GitHub Backlog

This chapter turns the proposal into trackable work. It lists the contractual
**deliverables (D1–D7)**, the **epic → story** backlog mapped to the milestones in
[05](05-roadmap.md), the **risk register**, and how to instantiate it all in GitHub using the
issue templates under [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE).

## 1. Deliverables

| ID | Deliverable | Description |
|----|-------------|-------------|
| D1 | System Architecture & API Spec | Architecture diagram, SBI contracts (OpenAPI 3.0), PKI design, threat model |
| D2 | Working 5G Core MVP | NRF/AMF/SMF/UPF/AUSF/UDM in Go + full mTLS + OAuth2 + MongoDB CSFLE |
| D3 | Conformance Test Suite | Go runner + YAML scenarios (TC-01…PERF-02), CI/CD integrated, all green |
| D4 | Anomaly Detection Engine | Rule-based + statistical sidecar, validated on ≥3 threat scenarios (SEC-01…03) |
| D5 | Containerised Deployment | Docker Compose w/ Vault, PKI, all NFs, RAN sim; optional K8s + Helm |
| D6 | Observability Stack | Prometheus + Grafana NF KPI dashboards + dedicated security-event dashboard |
| D7 | Technical Docs & Final Report | Architecture/deploy guides, test results, security analysis, live demo |

## 2. Epics → stories (backlog)

Each **Epic** maps to a deliverable and a phase. Story IDs are stable so they can be
referenced from commits and PRs. Convert each row below into a GitHub issue using the
**User Story** template; group them under the matching **Epic** issue.

### EPIC-1 — Foundations & Architecture  · D1 · P1–P2 · M0
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S1.1 | dev, a bootstrapped repo + `common` module (SBI client, logging) | NF skeleton starts, `/healthz` + `/metrics` return 200 |
| S1.2 | architect, SBI API contracts in OpenAPI 3.0 | Contracts lint clean; reviewed |
| S1.3 | security eng, a documented PKI design + threat model | D1 doc merged; threats traced to SEC test cases |

### EPIC-2 — Service Registry & Security Substrate  · D2 · P3 · M1
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S2.1 | dev, NRF with register/deregister/discover/status-notify | `GET /nnrf-nfm/v1/nf-instances` lists live NFs |
| S2.2 | security eng, internal PKI issuing per-NF X.509 certs | Certs issued + auto-rotated in deploy pipeline |
| S2.3 | security eng, mTLS enforced on all SBI calls | `SEC-01` passes |
| S2.4 | security eng, NRF as OAuth2 AS issuing scoped JWTs | `SEC-02` passes |

### EPIC-3 — Access & Mobility (AMF)  · D2 · P3 · M2
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S3.1 | dev, AMF SCTP/NGAP listener handling NG Setup | Wireshark shows correct NG Setup + Initial UE Message |
| S3.2 | dev, NAS Registration Request parsing from UERANSIM | `TC-01` reaches "registration started" |

### EPIC-4 — Authentication (AUSF + UDM)  · D2 · P3 · M3
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S4.1 | dev, UDM subscriber store + `GenerateAuthData` | Auth vector matches known 5G-AKA test vector |
| S4.2 | security eng, UDM sensitive fields encrypted (CSFLE) | IMSI/keys not readable in raw MongoDB |
| S4.3 | dev, AUSF `UEAuthentication` (5G-AKA) | `TC-02` passes; UE reaches Registered |

### EPIC-5 — Session Management (SMF)  · D2 · P3 · M4
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S5.1 | dev, SMF `CreateSMContext` + IP allocation | UE receives PDU Session Accept + IP; `uesimtun0` created |
| S5.2 | dev, AMF↔SMF (N11) + SMF↔UDM session data | `TC-03` control flow passes (UPF stubbed) |

### EPIC-6 — User Plane (UPF)  · D2 · P3 · M5
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S6.1 | dev, UPF PFCP agent translating PDR/FAR to gtp5g | PFCP Session Establishment succeeds |
| S6.2 | dev, GTP-U N3 tunnel + N6 NAT | `ping -I uesimtun0 8.8.8.8` succeeds |

### EPIC-7 — Conformance Test Framework  · D3 · P4 · M2→M5
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S7.1 | dev, a Go runner executing YAML scenarios | Runner reports pass/fail + pcap |
| S7.2 | dev, TC-01…TC-04 + SEC-01…03 implemented | All pass against the MVP |
| S7.3 | dev, GitHub Actions gate blocking merge on failure | Failing conformance test blocks PR |

### EPIC-8 — Anomaly Detection Engine  · D4 · P4 · M3→M6
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S8.1 | security eng, Phase-1 Prometheus rule-based detection | `SEC-03` raises alert within 10 probes |
| S8.2 | security eng, Phase-2 z-score/IQR statistical detection | Detects injected anomaly in test trace |
| S8.3 | researcher, Phase-3 isolation forest/LSTM *(stretch)* | Documented; non-blocking |

### EPIC-9 — Deployment & Observability  · D5,D6 · P5 · M6
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S9.1 | ops, `docker compose up` brings up full core + Vault + PKI | One command, reproducible |
| S9.2 | ops, Cilium/K8s network policies *(stretch)* | Disallowed NF pairs cannot talk |
| S9.3 | ops, Grafana KPI + security-event dashboards | Live counters move on UE attach |

### EPIC-10 — Validation & Final Report  · D7 · P6 · M7
| Story | As a… I want… | Acceptance |
|-------|---------------|------------|
| S10.1 | dev, full conformance run + load test (PERF-01/02) | All green; KPIs recorded |
| S10.2 | dev, fault-injection + anomaly validation | Scenarios in [16](16-conformance-test-framework.md) pass |
| S10.3 | author, final report + demo video | D7 delivered |

## 3. Risk register

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| NGAP/NAS complexity blocks AMF | Medium | Use UERANSIM NGAP as reference; +2 days/NF in P3 |
| PKI integration delays core | Low | CFSSL/cert-manager prebuilt image; ~1-day setup |
| Anomaly Phase 3 (ML) out of reach | High | Phase 3 is explicitly stretch; Phases 1–2 suffice |
| RAN simulator compatibility | Low | UERANSIM primary; OAI gNB fallback |
| Kubernetes track adds scope | Medium | K8s optional; Docker Compose is primary target |

## 4. Labels & workflow in GitHub
See [`.github/labels.md`](../.github/labels.md) for the label set (`type:epic`,
`type:story`, `phase:P1…P6`, `milestone:M0…M7`, `deliverable:D1…D7`, `security`,
`stretch`, `priority:*`). Suggested board columns: **Backlog → Ready → In progress →
In review → Done**, with one GitHub Milestone per `M0…M7`.

## Next
→ Back to [README](README.md)
