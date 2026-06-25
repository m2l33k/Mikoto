# SecureCore5G

A security-hardened control and management plane built around a [free5GC](https://www.free5gc.org/)
5G core network. The project adds OAuth2-based service authorization (3GPP TS 33.501),
runtime anomaly detection, an automated conformance test harness, and a security
dashboard, with an offline ML pipeline for training the detection models.

> **Status:** scaffold. Package structure, interfaces, key types and entrypoints are in
> place; most business logic is still marked `TODO`.

## Repository layout

```
.
├── Backend/      # Go workspace monorepo (services, shared packages, infra, deploy)
└── Frontend/     # Web UI for the security dashboard (planned)
```

### Backend

The backend is a Go workspace (`go.work`) tying several modules into one dependency graph.

```
Backend/
├── services/                 # custom Go microservices
│   ├── nrf-oauth2/           # OAuth2 authz server (3GPP TS 33.501 §13.3)      :8090
│   ├── anomaly-detector/     # 3-phase detection engine (rules/stats/ML)        :8091
│   ├── test-runner/          # TS 23.502 conformance harness (adapter pattern)  :8092
│   └── dashboard-api/        # security dashboard backend (Casdoor OIDC)         :8093
├── pkg/                      # publishable shared packages
│   ├── jwt-middleware/       # standalone 3GPP JWT validation middleware
│   └── 5g-types/             # shared 3GPP type definitions
├── infra/                    # third-party service configs (envoy, pki, vault, ...)
├── free5gc/config/           # free5GC NF configuration (source unmodified)
├── training/                 # offline ML pipeline (Python)
├── scenarios/                # YAML conformance scenarios
└── deploy/                   # docker-compose + k8s helm
```

See [`Backend/README.md`](Backend/README.md) for backend-specific details.

### Frontend

Reserved for the security dashboard web UI. Currently empty.

## Prerequisites

- **Go** 1.22+
- **Docker** & **Docker Compose**
- **Python** 3.10+ (for the ML training pipeline)
- `make`

## Quick start

All commands below are run from the `Backend/` directory.

```bash
make build       # build all services
make test        # unit tests
make up          # bring up the full stack via docker-compose
make conformance # run the conformance suite against free5GC
```

Run `make help` to list every available target.

## Configuration

Each service ships a `config.yaml.example`. Copy it to `config.yaml` (which is
git-ignored) and adjust locally:

```bash
cp services/nrf-oauth2/config.yaml.example services/nrf-oauth2/config.yaml
```

Secrets and local overrides (`.env`, `*.local.yaml`, generated certs, Vault init data)
are git-ignored — never commit them.

## License

Academic project — ESPRIT.

— Malek Aziz Hassayoun
