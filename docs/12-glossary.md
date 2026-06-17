# 12 — Glossary

Every acronym used in this documentation, defined in plain language.

## Network functions
| Acronym | Name | Role |
|---------|------|------|
| NRF | Network Repository Function | Service registry / discovery |
| AMF | Access & Mobility Management Function | Radio-facing control, registration |
| SMF | Session Management Function | PDU session lifecycle, controls UPF |
| UPF | User Plane Function | Forwards user data packets |
| AUSF | Authentication Server Function | Orchestrates 5G-AKA |
| UDM | Unified Data Management | Subscriber identity, keys, auth vectors |
| UDR | Unified Data Repository | Backing store for UDM (often merged in a prototype) |
| PCF | Policy Control Function | QoS & charging policy (stretch) |
| NSSF | Network Slice Selection Function | Picks a network slice (stretch) |
| NEF | Network Exposure Function | Exposes core APIs to external apps (stretch) |
| CHF | Charging Function | Charging/billing (stretch) |

## Architecture & interfaces
| Term | Meaning |
|------|---------|
| 5GC | 5G Core network |
| SBA | Service-Based Architecture |
| SBI | Service-Based Interface (HTTP/2 + JSON between NFs) |
| CUPS | Control & User Plane Separation |
| RAN | Radio Access Network |
| gNB | 5G base station (the radio node) |
| UE | User Equipment (the device/phone) |
| DN | Data Network (e.g. the internet) |
| N1..N6, N8, N11.. | Reference points (named interfaces) — see doc 01 |

## Protocols
| Term | Meaning |
|------|---------|
| NGAP | NG Application Protocol — gNB ↔ AMF signalling (over SCTP) |
| NAS | Non-Access Stratum — UE ↔ AMF signalling (mobility, session, auth) |
| PFCP | Packet Forwarding Control Protocol — SMF ↔ UPF (N4) |
| GTP-U | GPRS Tunnelling Protocol, User plane — tunnels user data |
| SCTP | Stream Control Transmission Protocol — transport for NGAP |
| HTTP/2 | Transport for SBI |

## Identities
| Term | Meaning |
|------|---------|
| SUPI | Subscription Permanent Identifier (internal IMSI) |
| SUCI | Subscription Concealed Identifier (encrypted SUPI over the air) |
| IMSI | International Mobile Subscriber Identity |
| GUTI | Globally Unique Temporary Identity (assigned by AMF) |
| PLMN | Public Land Mobile Network = MCC + MNC |
| MCC / MNC | Mobile Country / Network Code |
| TAC | Tracking Area Code |
| GUAMI | Globally Unique AMF Identifier |
| DNN | Data Network Name (the "APN" of 5G) |
| S-NSSAI | Single Network Slice Selection Assistance Info (SST + SD) |
| SST / SD | Slice/Service Type / Slice Differentiator |

## Security (5G-AKA)
| Term | Meaning |
|------|---------|
| 5G-AKA | 5G Authentication and Key Agreement |
| K | Long-term secret key (in SIM and UDM) |
| OPc | Operator key derived value (MILENAGE) |
| RAND | Random challenge |
| AUTN | Authentication token (network → UE) |
| RES* / XRES* | UE response / expected response |
| KAUSF / KSEAF / KAMF | Hierarchy of derived keys |
| SQN | Sequence number (replay protection) |
| MILENAGE | The cryptographic function set for AKA |

## Session / user plane
| Term | Meaning |
|------|---------|
| PDU session | A data connection from UE to a DN |
| PDR | Packet Detection Rule (UPF) |
| FAR | Forwarding Action Rule (UPF) |
| QER | QoS Enforcement Rule (UPF) |
| URR | Usage Reporting Rule (UPF) |
| TEID | Tunnel Endpoint Identifier (GTP-U) |
| AMBR | Aggregate Maximum Bit Rate |
| 5QI | 5G QoS Identifier |
| ARP | Allocation and Retention Priority |

## Tooling
| Term | Meaning |
|------|---------|
| UERANSIM | Open-source gNB + UE simulator |
| gtp5g | Linux kernel module implementing 5G GTP-U |
| MILENAGE library | Provides the AKA crypto so you don't implement it |

## Next
→ [13 — Resources & References](13-resources.md)
