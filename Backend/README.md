# SecureCore5G — Backend

Security-hardened control/management plane around a free5GC 5G core, organized as a
Go workspace monorepo. Docker Compose is the primary deployment target; Kubernetes
(Helm) is a stretch goal.

## Layout

```
go.work               # ties all modules into one dependency graph
services/             # custom Go microservices
  nrf-oauth2/         # OAuth2 authz server (3GPP TS 33.501 §13.3)      :8090
  anomaly-detector/   # 3-phase detection engine (rules/stats/ML)        :8091
  test-runner/        # TS 23.502 conformance harness (adapter pattern)  :8092
  dashboard-api/      # security dashboard backend (Casdoor OIDC)         :8093
pkg/                  # publishable shared packages
  jwt-middleware/     # standalone 3GPP JWT validation middleware
  5g-types/           # shared 3GPP type definitions
infra/                # third-party service configs (envoy, pki, vault, ...)
free5gc/config/       # free5GC NF configuration (source unmodified)
training/             # offline ML pipeline (Python)
scenarios/            # YAML conformance scenarios
deploy/               # docker-compose + k8s helm
```

## Quick start

```bash
make build       # build all services
make test        # unit tests
make up          # bring up the full stack via docker-compose
make conformance # run the conformance suite against free5GC
```

## Status

This is a **scaffold**: package structure, interfaces, key types and entrypoints are
in place; business logic is marked with `TODO`. There is no committed `go.sum` yet —
run `go mod tidy` per module (or `go work sync`) once a toolchain is available.

— Malek Aziz Hassayoun · ESPRIT
