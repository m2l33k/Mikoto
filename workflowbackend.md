# Backend Workflow & Endpoint Specification — `workflowbackend.md`

Full API contract between the **Angular frontend** (`Frontend/`) and the **Go backend**
(`Backend/services/dashboard-api`). Derived from a card-by-card analysis of every page in the
frontend: each card, table, chart, KPI, and action button is mapped to the endpoint(s) that
must serve it, the exact response schema the component binds to, and the upstream system the
`dashboard-api` BFF aggregates it from.

---

## 0. Architecture

```
Angular SPA ──HTTPS/JSON──▶ dashboard-api (BFF :8443)
                              │  Bearer JWT (Casdoor OIDC)
                              ├─▶ NRF (nrf-oauth2)        · NF registry, OAuth2 token audit
                              ├─▶ free5gc NFs (SBI mTLS)  · AMF/SMF/UDM/AUSF state
                              ├─▶ anomaly-detector        · alerts, threat models, z-scores
                              ├─▶ test-runner             · conformance runs, fault injection
                              ├─▶ Vault (infra/vault)     · PKI, leases, seal status, transit
                              ├─▶ Prometheus (infra/monitoring) · metrics, targets
                              ├─▶ Cilium/Hubble (infra/network-policy) · policies, flow verdicts
                              └─▶ MongoDB (CSFLE)         · subscribers, audit trail
```

**Existing routes** (in `services/dashboard-api/internal/api/server.go` — keep, extend):

| Implemented | Route | Upstream |
|---|---|---|
| ✅ | `GET /auth/callback` | Casdoor OIDC redirect |
| ✅ | `GET /api/v1/alerts` | anomaly-detector proxy |
| ✅ | `GET /api/v1/metrics` | Prometheus proxy |
| ✅ | `GET /api/v1/certs` | Vault PKI |
| ✅ | `GET /api/v1/runs` | test-runner proxy |
| ✅ | `GET /api/v1/stream` | SSE event stream |

Everything below extends this surface. Base path: **`/api/v1`**. All routes require
`Authorization: Bearer <jwt>` (via `pkg/jwt-middleware`) except `/auth/*`.

---

## 1. Global Conventions

### 1.1 List queries (matches frontend `TableController`)

Every list endpoint accepts:

| Param | Type | Meaning |
|---|---|---|
| `q` | string | free-text filter (fields per endpoint) |
| `sort` | string | field name |
| `dir` | `asc`\|`desc` | sort direction |
| `page` | int ≥ 1 | page number |
| `pageSize` | int (10/25/50) | rows per page |

List response envelope:

```json
{ "items": [ … ], "total": 128, "page": 1, "pageSize": 10 }
```

### 1.2 Errors

```json
{ "error": { "code": "DUPLICATE_SUPI", "message": "imsi-… already provisioned" } }
```

`400` validation · `401` missing/expired token · `403` RBAC scope violation ·
`404` unknown resource · `409` conflict · `503` upstream NF unavailable.

### 1.3 RBAC roles (frontend Access Control page)

`secops-admin` (full) · `netops-engineer` (sessions, conformance, observability, RAN) ·
`compliance-auditor` (audit, reports, read-only) · `read-only` (GET only).
Mutating endpoints below list their **required role**.

### 1.4 Realtime

`GET /api/v1/stream` (SSE) multiplexes typed events; the client subscribes with
`?topics=logs,events,alarms,notifications,metrics`. Event frame:

```json
{ "topic": "alarms", "ts": "2026-07-02T14:02:11.201Z", "data": { … } }
```

---

## 2. Authentication & Session (`/auth`, login/recover pages, shell)

| Component | Endpoint | Notes |
|---|---|---|
| Login form (`login.html`) | `POST /auth/login` | body `{ "identity", "passphrase", "environment", "enforceMtls" }` → `{ "token", "expiresAt", "session" }`. 401 on bad credentials. |
| Session restore (`AuthService`) | `GET /auth/session` | → `Session` (below). 401 if expired. |
| Sign-out (user menu, palette) | `POST /auth/logout` | revokes token server-side. |
| Key recovery (`recover.html`) | `POST /auth/recover` | body `{ "identity", "pgpSignature" }` → `202 { "recoveryToken" }`. Verifies detached signature against the operator's enrolled public key. |
| OIDC (Casdoor) | `GET /auth/callback` | existing — code→token exchange. |

```json
Session = {
  "identity": "admin-secops@telecom.node",
  "environment": "5G-LAB-PROD-SOUTH",
  "mtls": true,
  "since": 1782050000000,
  "role": "secops-admin",
  "displayName": "Malek Aziz H."
}
```

---

## 3. Shell (layout — every authenticated page)

| Component | Endpoint | Response shape |
|---|---|---|
| Environment selector | `GET /environments` | `["5G-LAB-PROD-SOUTH", "5G-LAB-DEV-NORTH", "5G-LAB-STAGING-EAST"]` |
| Switch environment | `PUT /me/environment` | body `{ "environment" }` — scopes subsequent queries. |
| Topbar `NRF 8/8 Registered` | `GET /system/status` | `{ "nfRegistered": 8, "nfExpected": 8, "mtlsMode": "strict-enforce", "coreState": "running", "vaultSealed": false }` |
| Notification bell + dropdown | `GET /notifications?limit=10` | `{ "items": [Notice], "unread": 4 }` · `Notice = { "id", "kind": "danger"\|"warning"\|"info", "title", "time" }` |
| Mark notifications read | `POST /notifications/read` | body `{ "ids": [] }` (empty = all) |
| Live badge updates | SSE topic `notifications` | pushes `Notice` frames |

---

## 4. Platform Overview (`/overview`)

| Card | Endpoint | Response shape |
|---|---|---|
| Head badges (Core/Vault/Degraded) | `GET /system/status` | shared with shell (§3) |
| **KPI strip** (5 cards: NFs Online, Active Subscribers, PDU Sessions, mTLS Coverage, Open Anomalies) | `GET /dashboard/kpis` | ```{ "nfsOnline": {"up": 8, "total": 8}, "subscribers": {"provisioned": 1284, "registeredNow": 2}, "pduSessions": {"active": 2, "gtpuGbps": 14.2}, "mtls": {"coveragePct": 100, "identities": 12}, "anomalies": {"open": 1, "critical": 1, "warning": 0} }``` |
| SBI Signalling Rate (area chart) | `GET /metrics/series?metric=sbi_rate&range=1h` | `{ "labels": ["13:00", …], "series": [{ "name": "req/s", "data": [2310, …] }] }` — `range ∈ 15m\|1h\|6h\|24h` (toolbar) |
| Conformance gauge | `GET /conformance/summary` | `{ "passRatePct": 83, "passed": 10, "failed": 1, "skipped": 1, "standard": "TS 23.502" }` |
| GTP-U Throughput (bar chart) | `GET /metrics/series?metric=gtpu_throughput&range=1h` | same series envelope, unit Gbps |
| **NF Health grid** (per-NF card: status dot, sparkline, CPU/MEM) | `GET /nf/health` | `[{ "nf": "AMF", "role": "Access & Mobility", "status": "healthy"\|"degraded"\|"down", "cpu": 41, "mem": 58, "trend": [39,41,…] }]` |
| Recent System Events table | `GET /events?limit=20` | `[{ "time", "severity": "critical"\|"warning"\|"info", "source", "message" }]` + SSE topic `events` |
| Action: Refresh | re-issues the GETs above | — |
| Action: Go Live | SSE topic `metrics` (1 s deltas) | — |
| Action: Export | `GET /dashboard/export` | `text/csv` snapshot |
| Action: Ack Alerts | `POST /alerts/ack-all` | role `secops-admin`/`netops-engineer` |
| Action: Run Diagnostics | `POST /diagnostics/run` | `202 { "jobId" }`; result via SSE topic `events` |

---

## 5. Service Topology (`/topology`)

| Component | Endpoint | Response shape |
|---|---|---|
| SBA mesh (nodes + edges + planes) | `GET /topology` | ```{ "nodes": [{ "id": "AMF", "label", "sub", "plane": "control"\|"user"\|"access" }], "edges": [{ "a": "AMF", "b": "SMF", "ref": "N11 / Nsmf", "kind": "sbi"\|"radio"\|"data", "mtls": true }] }``` — layout (x/y) stays client-side |
| Node drawer (peer interfaces) | derived client-side from `/topology` | — |
| Live edge health (optional) | SSE topic `topology` | `{ "edge": "AMF-SMF", "state": "up"\|"degraded" }` |

Upstream: NRF registrations + static 3GPP reference topology.

---

## 6. NF Registry (`/registry`) — NRF

| Component | Endpoint | Response shape |
|---|---|---|
| KPI row (instances, exposed services, heartbeat SLA) | `GET /nrf/summary` | `{ "instances": 8, "active": 7, "suspended": 1, "services": 11, "heartbeatSlaPct": 99.98, "timeoutSec": 30, "intervalSec": 10 }` |
| Registered NFs table (sortable: type/fqdn/load/status; search: type/fqdn/services) | `GET /nrf/instances` + §1.1 params | `NfInstance = { "type", "instanceId", "fqdn", "endpoint", "status": "registered"\|"suspended"\|"deregistered", "heartbeat", "load", "services", "tls" }` |
| NF drawer discovery preview | `GET /nrf/instances/{instanceId}/discovery` | `{ "query": "GET /nnrf-disc/v1/nf-instances?target-nf-type=SMF", "hits": 1, "ttlSec": 30 }` |
| Suspend / Resume NF | `POST /nrf/instances/{instanceId}/status` | body `{ "status": "suspended"\|"registered" }` · role `secops-admin` |
| CSV export | `GET /nrf/instances/export` | `text/csv` |

Upstream: `services/nrf-oauth2` management API.

---

## 7. Subscribers (`/subscribers`) — UDM / CSFLE

| Component | Endpoint | Response shape |
|---|---|---|
| KPI row (provisioned, CSFLE coverage, auth vectors) | `GET /udm/summary` | `{ "provisioned": 1284, "registeredNow": 2, "idleNow": 2, "csfleCoveragePct": 100, "authVectorsIssued": 3910 }` |
| Subscriber Directory (paginated, sortable: supi/msisdn/slice/amf/auth/status; search: supi/msisdn/slice) | `GET /udm/subscribers` + §1.1 params | `Subscriber = { "supi", "msisdn", "status": "registered"\|"idle"\|"deregistered", "slice", "servingAmf", "authMethod" }` |
| Subscriber drawer (sealed credentials) | `GET /udm/subscribers/{supi}` | `Subscriber` + `{ "credentials": { "k": "sealed", "opc": "sealed", "sqn": "sealed" } }` — **plaintext never leaves the UDM** |
| Provision drawer form | `POST /udm/subscribers` | body `{ "imsi": "^\\d{15}$", "msisdn", "slice", "authMethod": "5G-AKA"\|"EAP-AKA'" }` → `201 Subscriber`. `400 INVALID_IMSI`, `409 DUPLICATE_SUPI`. K/OPc generated server-side, sealed via CSFLE before write. Role `secops-admin`. |
| Deregister action | `POST /udm/subscribers/{supi}/deregister` | releases sessions, clears AMF context → `200 Subscriber` |
| CSFLE Field Schema table | `GET /udm/csfle-schema` | `[{ "field": "permanentKey (K)", "algo": "AEAD_AES_256_CBC_HMAC_SHA_512", "keyId": "key-id-077c-b", "state": "encrypted" }]` |
| CSV export | `GET /udm/subscribers/export?q=` | `text/csv` of the filtered set |

Upstream: MongoDB (CSFLE) via UDM; Vault Transit wraps the data keys.

---

## 8. PDU Sessions (`/sessions`) — SMF/UPF

| Component | Endpoint | Response shape |
|---|---|---|
| KPI cards + throughput trend | `GET /smf/summary` | `{ "active": 2, "establishing": 1, "released24h": 6, "gtpuGbps": 14.2, "throughputTrend": [9,11,…] }` |
| Session table | `GET /smf/sessions` + §1.1 | `PduSession = { "id", "supi", "dnn", "snssai", "pduType", "upf", "teid", "fiveQi", "ul", "dl", "state": "active"\|"establishing"\|"released" }` |
| Session drawer | `GET /smf/sessions/{id}` | `PduSession` + PFCP detail |
| Release session | `DELETE /smf/sessions/{id}` | SMF sends PFCP Session Deletion, frees TEID → `200 PduSession(state=released)` · role `netops-engineer`+ |

---

## 9. Network Slicing (`/slicing`) — NSSF

| Component | Endpoint | Response shape |
|---|---|---|
| Traffic by slice (stacked bars) | `GET /nssf/traffic?range=4h` | `{ "labels": ["12:00",…], "series": [{ "name": "eMBB", "data": [62,…] }, …] }` |
| Throughput per slice (h-bars) | `GET /nssf/throughput` | `[{ "label": "eMBB (01-000001)", "valueMbps": 11200 }]` |
| Slice table + SLA gauges | `GET /nssf/slices` | `Slice = { "snssai", "type", "dnn", "sessions", "slaLatency", "utilisation", "status": "active"\|"degraded"\|"disabled" }` |
| Enable / disable slice | `PATCH /nssf/slices/{snssai}` | body `{ "status": "active"\|"disabled" }` · role `secops-admin` |

---

## 10. RAN / gNB (`/ran`) — UERANSIM

| Component | Endpoint | Response shape |
|---|---|---|
| PRB utilisation heatmap | `GET /ran/prb?range=4h` | `{ "columns": ["12:00",…], "rows": [{ "label": "Cell-01", "values": [42,…] }] }` |
| Cells table | `GET /ran/cells` | `Cell = { "cell", "pci", "tac", "band", "ues", "prb", "rsrp", "status": "up"\|"congested"\|"down" }` |
| Connected UEs table | `GET /ran/ues` | `Ue = { "supi", "cell", "rsrp", "cqi", "state": "RRC_CONNECTED"\|… }` |

---

## 11. SecOps Console (`/secops`)

| Component | Endpoint | Response shape |
|---|---|---|
| Cilium policy snapshot table | `GET /secops/policies` | `{ "source", "target", "protocol", "mode", "state": "enforced"\|"blocked" }` (read view of §13) |
| Live anomaly feed | `GET /secops/anomalies` + SSE topic `anomalies` | `{ "id", "time", "sourceIp", "type", "severity": "critical"\|"warning" }` |
| Mitigate action | `POST /secops/anomalies/{id}/mitigate` | pushes Cilium drop policy, quarantines source → `200` · role `secops-admin` |

Upstream: anomaly-detector + Cilium API.

---

## 12. PKI & Certificates (`/pki`) — Vault PKI

| Component | Endpoint | Response shape |
|---|---|---|
| Certificate inventory (expiry meters) | `GET /pki/certificates` *(extends existing `GET /api/v1/certs`)* | `Cert = { "nf", "cn", "serial", "algo", "issued", "expires", "daysLeft" }` |
| Cert drawer | `GET /pki/certificates/{serial}` | `Cert` + chain / SANs |
| Rotate certificate | `POST /pki/certificates/{serial}/rotate` | issues fresh leaf from `5GC-SBI-Issuer`, hot-swaps on node → `200 Cert` · role `secops-admin` |
| Expiry alerts (≤3d danger, ≤10d warning) | computed client-side from `daysLeft` | — |

---

## 13. Network Policies (`/policies`) — Cilium/eBPF

| Component | Endpoint | Response shape |
|---|---|---|
| Policy table (hits counters) | `GET /policies` + §1.1 | `Policy = { "name", "source", "dest", "l7", "ports", "action": "allow"\|"deny", "hits" }` |
| Create policy drawer | `POST /policies` | body `{ "name", "source", "dest", "ports", "action" }` → `201 Policy` · `400 NAME_REQUIRED`, `409` duplicate name · role `secops-admin` |
| Toggle allow/deny | `PATCH /policies/{name}` | body `{ "action" }` — recompiles eBPF program · role `secops-admin` |
| Denied flows (live) | `GET /policies/denied-flows?limit=50` + SSE topic `flows` | `{ "time", "source", "dest", "verdict" }` |

Upstream: Cilium/Hubble (`infra/network-policy`).

---

## 14. Secrets Vault (`/secrets`) — HashiCorp Vault

| Component | Endpoint | Response shape |
|---|---|---|
| Seal status + toggle | `GET /vault/status` · `POST /vault/seal` · `POST /vault/unseal` | `{ "sealed": false, "version", "clusterName" }` · seal/unseal role `secops-admin`, unseal body `{ "shards": [] }` |
| Secret engines table | `GET /vault/engines` | `Engine = { "path", "type", "description", "secrets" }` |
| Lease activity table | `GET /vault/leases?limit=50` | `Lease = { "id", "time", "consumer", "path", "ttl", "action": "lease"\|"renew"\|"revoke" }` |
| Revoke lease | `POST /vault/leases/{id}/revoke` | → `200 Lease(action=revoke, ttl=0)` · role `secops-admin` |

---

## 15. Key Rotation (`/key-rotation`)

| Component | Endpoint | Response shape |
|---|---|---|
| Form options (scopes, nodes) | `GET /pki/rotation/options` | `{ "scopes": ["Service-Based Interface (SBI)", …], "nodes": ["SBI-PROD-AMF-NODE-01", …], "keyspaces": ["RSA-4096", "ECDSA-P384"] }` |
| Current cert telemetry (valid-for, expiry %) | `GET /pki/rotation/status?node=` | `{ "validForHours": 32, "expiredPct": 64, "keyspace": "RSA-4096" }` |
| Execute re-generation | `POST /pki/rotation/execute` | body `{ "node", "scope", "keyspace", "lifetimeHours": 1–8760 }` → `202 { "jobId" }`; completion via SSE `events` · role `secops-admin` |
| Retract (compromise response) | `POST /pki/rotation/retract` | body `{ "node" }` — immediate revocation, SBI calls rejected until re-issue · role `secops-admin` |

---

## 16. NetOps Core (`/netops`)

Composite view — reuses:

| Component | Endpoint |
|---|---|
| Conformance snapshot table | `GET /conformance/tests` (§18) |
| Live core log console | SSE topic `logs` (§17) |
| Session/NF quick stats | `GET /dashboard/kpis` (§4) |

---

## 17. Anomaly Detection (`/anomaly`) & Logs Explorer (`/logs`)

### Anomaly

| Component | Endpoint | Response shape |
|---|---|---|
| Registration trend sparkline + detection chart (rate vs adaptive z-threshold) | `GET /anomaly/detection?range=2h` | `{ "labels": [...], "series": [{ "name": "Registrations/min", "data": […] }, { "name": "Detection threshold", "dashed": true, "data": […] }] }` |
| Threat model cards (armed/triggered, hits) | `GET /anomaly/threat-models` | `{ "name", "signal", "method", "status": "armed"\|"triggered", "hits" }` |
| Alerts table *(extends existing `GET /api/v1/alerts`)* | `GET /anomaly/alerts` + §1.1 | `Alert = { "id", "time", "threat", "source", "score": "z=6.4", "severity": "critical"\|"warning"\|"info", "state": "open"\|"mitigated" }` |
| Mitigate | `POST /anomaly/alerts/{id}/mitigate` | Cilium quarantine of source → `200 Alert(state=mitigated)` · role `secops-admin` |

### Logs

| Component | Endpoint | Response shape |
|---|---|---|
| Log query (NF filter, severity filter, text) | `GET /logs?nf=AMF&sev=error&q=&limit=200` | `LogLine = { "ts": "14:02:11.201", "nf", "sev": "info"\|"warn"\|"error"\|"debug", "msg" }` |
| Live tail toggle | SSE topic `logs` | pushes `LogLine` frames (~1/s) |
| Error/warn counters | included in list response: `{ "items": […], "counts": { "error": 2, "warn": 2 } }` | — |

Upstream: `services/anomaly-detector`; logs via Loki/centralised collector.

---

## 18. Conformance Tests (`/conformance`) — test-runner

| Component | Endpoint | Response shape |
|---|---|---|
| Pass-rate gauge | `GET /conformance/summary` (§4) | — |
| Test case table (TC/SEC/PERF) | `GET /conformance/tests` | `TestCase = { "id": "TC-01", "name", "procedure": "TS 23.502 §4.2.2.2", "criterion", "latency", "status": "pass"\|"fail"\|"skip", "pcapUrl" }` |
| CI run history *(extends existing `GET /api/v1/runs`)* | `GET /conformance/runs` | `CiRun = { "id", "commit", "trigger", "passed", "failed", "duration", "status": "success"\|"failed" }` |
| Fault injection scenarios | `GET /conformance/fault-scenarios` | `FaultScenario = { "name", "inject", "expected", "result": "pass"\|"fail" }` |
| Run suite button | `POST /conformance/run` | `202 { "runId" }` — brings up core + UERANSIM, executes scenarios; progress via SSE `events` · role `netops-engineer`+ |
| pcap evidence download | `GET /conformance/tests/{id}/pcap` | `application/vnd.tcpdump.pcap` |

Upstream: `services/test-runner`, `scenarios/{standard,security,performance,fault}`.

---

## 19. Observability (`/observability`) — Prometheus

| Component | Endpoint | Response shape |
|---|---|---|
| SBI request rate (area) | `GET /metrics/series?metric=sbi_rate&range=` | §4 series envelope |
| Latency p50/p95/p99 (area) | `GET /metrics/series?metric=sbi_latency&range=` | 3 series: p50/p95/p99 (ms) |
| 5xx error bars | `GET /metrics/series?metric=sbi_errors&range=` | single series |
| HTTP status mix (donut) | `GET /metrics/status-mix?range=24h` | `[{ "name": "2xx Success", "value": 1842310 }, …]` |
| Per-NF CPU/MEM load | `GET /metrics/nf-load` | `[{ "nf": "AMF", "cpu": 41, "mem": 58 }]` |
| Scrape targets table | `GET /metrics/targets` | `Target = { "job", "instance", "scrape": "1.2s ago", "up": true }` |
| Toolbar auto-refresh | client re-polls; or SSE topic `metrics` | — |

*(All are PromQL behind the existing `GET /api/v1/metrics` proxy — the `metric=` names map to recording rules.)*

---

## 20. Alarms Center (`/alarms`)

| Component | Endpoint | Response shape |
|---|---|---|
| KPI counts + severity donut | `GET /alarms/summary` | `{ "critical": 1, "major": 2, "minor": 2, "cleared24h": 1 }` |
| Alarms-by-hour heatmap | `GET /alarms/heatmap?range=8h` | `{ "columns": [...], "rows": [{ "label": "Critical", "values": [0,1,…] }] }` |
| Alarm list (sortable id/time/severity/source/state) | `GET /alarms` + §1.1 | `Alarm = { "id": "ALM-4471", "time", "severity": "critical"\|"major"\|"minor", "source", "summary", "state": "active"\|"acked"\|"cleared" }` |
| Ack | `POST /alarms/{id}/ack` | → `200 Alarm(state=acked)` |
| Clear | `POST /alarms/{id}/clear` | → `200 Alarm(state=cleared)` |
| CSV export | `GET /alarms/export` | `text/csv` |
| Live updates | SSE topic `alarms` | new/changed `Alarm` frames |

---

## 21. Audit Vault (`/audit`) & Reports (`/reports`)

### Audit

| Component | Endpoint | Response shape |
|---|---|---|
| OAuth2 token audit table | `GET /audit/tokens?limit=100` + §1.1 | `TokenAudit = { "timestamp", "consumer", "provider", "scope": "nudm-sdm", "status": "valid"\|"revoked" }` |
| CSFLE encrypted-field registry | `GET /audit/csfle-fields` | `EncryptedField = { "scope": "subscriber_db.profiles.imsi", "keyId", "algorithm" }` |

Upstream: NRF OAuth2 issuance log + Vault audit device (append-only).

### Reports

| Component | Endpoint | Response shape |
|---|---|---|
| Template cards (4) | `GET /reports/templates` | `Template = { "id", "name", "standard", "description" }` |
| Generate (PDF/CSV) | `POST /reports/generate` | body `{ "templateId", "format": "PDF"\|"CSV", "period" }` → `202 Report(status=generating)`; completion via SSE `events` |
| Generated reports table | `GET /reports` | `Report = { "name", "type", "period", "format", "size", "status": "ready"\|"generating" }` |
| Download | `GET /reports/{name}/download` | `application/pdf` \| `text/csv` |

---

## 22. Access Control (`/access`) & Settings (`/settings`)

### Access Control (IAM — backed by Casdoor)

| Component | Endpoint | Response shape |
|---|---|---|
| Operators table | `GET /iam/operators` + §1.1 | `Operator = { "name", "identity", "role", "lastActive", "status": "active"\|"disabled" }` |
| Add operator drawer | `POST /iam/operators` | body `{ "name", "identity", "role" }` → `201` · `400 MISSING_FIELDS`, `409` duplicate identity · role `secops-admin` |
| Enable / disable | `PATCH /iam/operators/{identity}` | body `{ "status" }` — disabling terminates active sessions · role `secops-admin` |
| Roles & scopes table | `GET /iam/roles` | `Role = { "role", "scope", "members" }` |

### Settings

| Component | Endpoint | Notes |
|---|---|---|
| Profile card | `GET /me/profile` · `PUT /me/profile` | `{ "displayName", "role", "identity" }` |
| Notification + security prefs | `PUT /me/preferences` | `{ "notifyCritical", "notifyWarning", "notifyInfo", "autoRotate", "enforceMtls" }` |
| Theme / environment | client-side (`PrefsService`, localStorage) — no endpoint | — |
| Revoke all sessions | `POST /me/sessions/revoke-all` | invalidates every token for the caller |

---

## 23. Implementation Order (suggested)

1. **Auth + session** (§2) — everything else depends on the JWT. Casdoor flow exists.
2. **`/system/status`, `/dashboard/kpis`, `/nf/health`, `/events`** (§3–4) — lights up the Overview.
3. **NRF + UDM + SMF resources** (§6–8) — core CRUD, exercises pagination contract.
4. **Vault/PKI family** (§12, 14, 15) — certs endpoint already stubbed.
5. **Anomaly + alarms + logs + SSE stream** (§11, 17, 20) — realtime plumbing once.
6. **Conformance + observability proxies** (§18–19) — thin proxies over test-runner/Prometheus.
7. **Audit, reports, IAM, settings** (§21–22).

## 24. Cross-cutting requirements

- **Zero-trust posture:** dashboard-api talks to NFs over mTLS with its own SPIFFE-style identity; it never stores NF credentials (Vault dynamic creds only).
- **CSFLE boundary:** subscriber K/OPc/SQN are never returned by any endpoint — only `"sealed"` markers (§7).
- **Idempotency:** all `POST …/mitigate|ack|clear|rotate` accept an `Idempotency-Key` header.
- **Audit trail:** every mutating call is written to the Vault audit log with `{identity, role, route, resource, result}` — this feeds §21.
- **OpenAPI:** generate `openapi.yaml` from this document as D1 deliverable (API contracts requirement in the proposal).
