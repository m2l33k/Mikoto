# 00 — Overview & Vision

## What we are building

A **cloud-native 5G Core Network prototype**: a set of independent micro-services
("network functions") that together implement the control and user plane of a 5G
mobile core, following the 3GPP Release 15+ Service-Based Architecture (SBA).

It is not a full standards-compliant product. It is an **educational, demonstrable
prototype** that implements the *minimum* needed to carry real user traffic for a
simulated phone — while exercising every important layer: radio-facing signalling,
internal service APIs, the user-plane data path, deployment, and observability.

## Why a 5G Core is a great engineering project

| It teaches you… | Because the core requires… |
|-----------------|----------------------------|
| Distributed systems | Multiple services that register, discover, and coordinate |
| Network protocols | NGAP, NAS, PFCP, GTP-U, HTTP/2 |
| API design | Clean service-based REST contracts (SBI) |
| Cloud-native ops | Containers, orchestration, monitoring |
| Security | 5G-AKA mutual authentication, key derivation |

## Scope: the Minimal Viable Core (MVP)

We implement **six** network functions:

| NF | One-line responsibility |
|----|-------------------------|
| **NRF** | Registry — every NF registers here; others discover each other through it |
| **AMF** | Talks to the radio (gNB) over SCTP/NGAP; orchestrates registration & sessions |
| **AUSF** | Runs the authentication algorithm (5G-AKA) |
| **UDM** | Owns subscriber identity & keys; derives auth vectors |
| **SMF** | Manages PDU sessions; controls the UPF over PFCP; allocates UE IP |
| **UPF** | Forwards user packets between the UE tunnel and the internet (GTP-U) |

### Explicitly out of scope (stretch goals)
PCF (policy), NSSF (slicing), NEF (exposure), CHF (charging), BSF, N3IWF/TNGF
(non-3GPP access), roaming, handover, paging optimisation, full IE coverage.

## Build vs. reuse — an honest position

Implementing every protocol byte-for-byte from scratch is **not realistic** in one
internship. The smart approach:

- **Write yourself:** the NF business logic, the state machines, the SBI services,
  the service registration/discovery, the call-flow orchestration, config, and
  deployment. *This is where the engineering value and your contribution live.*
- **Reuse libraries for low-level encoding:** NGAP/NAS ASN.1 codecs, PFCP message
  encoders, SCTP sockets, GTP-U / the `gtp5g` kernel module. Re-deriving these is
  pure plumbing and would consume the whole project. See
  [03-technology-stack.md](03-technology-stack.md).

This mirrors how real products are built: nobody hand-writes an ASN.1 PER codec for
a demo. State this clearly in your report — it is a strength, not a shortcut.

## Success criteria (Definition of Done)

The prototype is complete when a simulated UE can:

1. **Register** — UE attaches; AMF accepts; subscriber state recorded.
2. **Authenticate** — 5G-AKA completes (UDM → AUSF → AMF → UE).
3. **Establish a PDU session** — SMF programs the UPF; UE gets an IP.
4. **Send data** — `ping 8.8.8.8` over the UE tunnel succeeds through your UPF.
5. **Be observed** — Grafana shows live registration/session/throughput KPIs.

## Non-functional goals

- Each NF is **independently buildable, runnable, and containerised**.
- Configuration is **externalised** (YAML), not hard-coded.
- **Structured logging** across all NFs with a correlation/trace id.
- Reproducible: `docker compose up` (or one script) brings up the whole core.

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Protocol complexity (NGAP/NAS) overwhelms timeline | Reuse codec libraries; implement only the IEs used by the simulator |
| `gtp5g` kernel module won't load (esp. on Windows/Docker Desktop) | Develop in an Ubuntu VM; see [04-environment-setup.md](04-environment-setup.md) |
| Scope creep into PCF/NSSF | Freeze MVP to 6 NFs; treat the rest as stretch |
| Interop debugging is hard | Capture every step with Wireshark; compare against a reference trace |

## Next

→ [01 — 5G Architecture Primer](01-5g-architecture-primer.md)
