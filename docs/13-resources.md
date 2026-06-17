# 13 — Resources & References

Where to learn each piece and where to find the libraries you reuse.

## 1. The 3GPP specifications (the source of truth)

You do **not** read these cover to cover. Use them as references for message
formats and procedures, milestone by milestone.

| Spec | Title | Use it for |
|------|-------|-----------|
| TS 23.501 | System architecture for the 5G System | The big picture, NFs, reference points |
| TS 23.502 | Procedures for the 5G System | **Call flows** (registration, PDU session) |
| TS 24.501 | NAS protocol for 5GS | NAS message formats (M2–M4) |
| TS 38.413 | NG Application Protocol (NGAP) | N2 messages (M2) |
| TS 29.244 | Interface between control & user plane (PFCP) | N4 / UPF (M5) |
| TS 33.501 | Security architecture | 5G-AKA, key derivation (M3) |
| TS 29.500 / 29.501 | SBI principles & framework | API conventions (all SBI) |
| TS 29.510 | NRF services | NRF API (M1) |
| TS 29.503 | UDM services | UDM API (M3) |
| TS 29.509 | AUSF services | AUSF API (M3) |
| TS 29.502 | SMF services | SMF API (M4) |
| TS 29.518 | AMF services | AMF API (M2–M4) |

> Find them free at the 3GPP specifications portal (search "3GPP TS 23.502").

## 2. Reusable open-source building blocks

The open-source 5G ecosystem publishes Go libraries you can import as dependencies
while writing your own NF logic. Typical sources:

| Need | Where to look |
|------|---------------|
| NGAP codec | `github.com/free5gc/ngap` |
| NAS codec | `github.com/free5gc/nas` |
| PFCP | `github.com/free5gc/pfcp`, `github.com/wmnsk/go-pfcp` |
| SCTP | `github.com/ishidawataru/sctp` |
| GTP / data path | `github.com/free5gc/gtp5g` (kernel module), `github.com/wmnsk/go-gtp` |
| AKA crypto / MILENAGE | `github.com/free5gc/util` (auth), or dedicated milenage libs |
| OpenAPI 5G models | `github.com/free5gc/openapi` |
| HTTP routing | `github.com/gin-gonic/gin` |
| Config | `github.com/spf13/viper`, `gopkg.in/yaml.v3` |
| Logging | `github.com/sirupsen/logrus`, `go.uber.org/zap` |
| Metrics | `github.com/prometheus/client_golang` |
| Mongo | `go.mongodb.org/mongo-driver` |

> Track each dependency's license (mostly Apache-2.0) in your `THIRD-PARTY.md`.

## 3. Reference implementations to study (not copy)

Reading a mature open-source core helps you understand structure and message
handling. Study how they organise an NF, then write your own:

- **free5GC** — Go, modular, the closest match to this roadmap's design.
- **Open5GS** — C, very complete, great for comparing call flows.
- **OAI 5G Core** (OpenAirInterface) — research-grade.

Use Wireshark traces from these as your "known-good" reference when debugging.

## 4. Simulators & test tools

| Tool | Purpose |
|------|---------|
| UERANSIM | gNB + UE simulator (primary) |
| PacketRusher | High-load gNB/UE simulator (stress testing) |
| my5G-RANTester | Alternative RAN tester |
| Wireshark | Decode NGAP/NAS/PFCP/GTP |

## 5. Learning path (suggested order)

1. Watch/read an "intro to 5G core architecture" overview → fixes the mental model.
2. Read **TS 23.501** §4 (architecture) and **TS 23.502** §4.2 (registration) and
   §4.3 (PDU session) — just those sections.
3. Skim a free5GC NF's source to see how a real Go NF is laid out.
4. Build M1 (NRF) — small, confidence-building.
5. Tackle M2 (AMF/NGAP) with TS 38.413 + TS 24.501 open beside you.

## 6. Glossary & internal docs
- Acronyms: [12-glossary.md](12-glossary.md)
- Architecture: [02-system-architecture.md](02-system-architecture.md)
- Flows: [07-call-flows.md](07-call-flows.md)

## 7. Citation hygiene for your report
- Cite the exact 3GPP TS + release for every procedure you implement.
- Credit every reused library with its license.
- Keep your pcaps and Grafana screenshots as primary evidence.

---

You now have the full roadmap. Start at [README.md](README.md) → [00-overview.md](00-overview.md).
