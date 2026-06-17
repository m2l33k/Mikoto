# 03 — Technology Stack

Concrete choices, with the reasoning, so you can defend them in your report.

## 1. Primary language: Go

| Reason | Detail |
|--------|--------|
| Concurrency | Goroutines map naturally to many simultaneous UE sessions |
| Static binaries | `CGO_ENABLED=0 go build` → tiny containers, easy deployment |
| HTTP/2 first-class | `net/http` speaks HTTP/2 out of the box (needed for SBI) |
| Ecosystem | The major open-source 5G cores are written in Go — libraries exist |
| Readability | Easy for a reviewer/jury to follow |

> Alternative: C++ gives raw performance (good for UPF) but slows control-plane
> development. We use Go for control plane and a kernel module for the data path.

## 2. Recommended libraries (reuse the hard parts)

These let you skip thousands of lines of low-level codec work. They are the building
blocks the open-source 5G ecosystem already provides.

| Need | Library kind | What it does for you |
|------|--------------|----------------------|
| NGAP encode/decode | NGAP ASN.1 codec | Build/parse N2 messages |
| NAS encode/decode | NAS codec | Build/parse UE↔AMF messages |
| PFCP | PFCP library | Build/parse N4 messages (SMF↔UPF) |
| SCTP | SCTP socket library | N2 transport |
| 5G crypto | MILENAGE / KDF library | Auth vectors, key derivation |
| HTTP/2 SBI | Gin or stdlib `net/http` | REST servers + routers |
| OpenAPI models | Generated structs | 3GPP-defined JSON schemas |
| Config | `viper` / `yaml.v3` | Load YAML config |
| Logging | `logrus` / `zap` | Structured logs |
| Metrics | `prometheus/client_golang` | `/metrics` endpoint |
| UUID | `google/uuid` | nfInstanceId |
| Mongo | `mongo-go-driver` | Subscriber storage |

> **How to find them:** the open-source `free5gc` and `omec`/`aether` ecosystems
> publish reusable Go modules (e.g. under `github.com/free5gc/...`) for NGAP, NAS,
> PFCP, SCTP, OpenAPI models, and crypto. You may import these as *libraries* while
> writing the NF logic yourself. Document each import and its license in your report.

## 3. The data path: gtp5g

The UPF must move real packets between the GTP-U tunnel (N3) and the internet (N6).
Doing this in user space is slow and complex; instead use **`gtp5g`**, a Linux
kernel module that implements 5G GTP-U with PDR/FAR rules. Your UPF service just
programs it over a netlink/PFCP bridge.

- Repo: `github.com/free5gc/gtp5g`
- Requires: Linux, kernel headers, `make`, root to `insmod`.
- This is the single biggest environment constraint — see
  [04-environment-setup.md](04-environment-setup.md).

## 4. RAN/UE simulator

You will not build a gNB or a phone. Use a software simulator to drive the core:

| Tool | Role |
|------|------|
| **UERANSIM** | Simulates gNB + UE; speaks NGAP/NAS; creates a `uesimtun0` tunnel |
| (alt) PacketRusher | Higher-load gNB/UE simulator for stress testing |

A successful `ping` over the simulator's tunnel interface is your end-to-end proof.

## 5. Data & infrastructure

| Component | Choice | Use |
|-----------|--------|-----|
| Database | MongoDB | Subscriber profiles, auth keys, session records |
| Containers | Docker + Docker Compose | Local orchestration |
| Orchestration (stretch) | Kubernetes + Helm | Cloud-native deployment |
| Metrics | Prometheus | Scrape each NF's `/metrics` |
| Dashboards | Grafana | KPI visualisation |
| Tracing (optional) | OpenTelemetry + Jaeger | Follow a call across NFs |
| Packet analysis | Wireshark / tcpdump | Verify NGAP/NAS/PFCP/GTP on the wire |

## 6. Dev tooling

| Tool | Purpose |
|------|---------|
| Go 1.26+ | Compiler/toolchain |
| Make | Build all NFs |
| golangci-lint | Linting |
| Git + GitHub | Version control, submodules, CI |
| GitHub Actions | CI: build + test on each push |
| VS Code + Go extension | IDE |
| Postman / curl | Hit SBI APIs manually |

## 7. Minimum host requirements

| Resource | Minimum | Comfortable |
|----------|---------|-------------|
| OS | Ubuntu 22.04 (VM or bare metal) | Same |
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Disk | 20 GB | 40 GB |
| Kernel | Allows custom modules (`gtp5g`) | Same |

> **Windows note:** develop inside an Ubuntu VM or WSL2. The control-plane NFs can
> run under Docker Desktop, but the UPF/`gtp5g` data path needs a Linux kernel you
> can load modules into — a real VM is the reliable choice.

## 8. License hygiene

- Track every third-party library and its license (most 5G Go libs are Apache-2.0).
- Keep a `THIRD-PARTY.md` in your repo.
- Your own code can be MIT/Apache — state it.

## Next

→ [04 — Environment Setup](04-environment-setup.md)
