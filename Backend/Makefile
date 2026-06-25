# SecureCore5G — Backend Makefile
SHELL := /bin/bash

SERVICES := nrf-oauth2 anomaly-detector test-runner dashboard-api
COMPOSE  := docker compose -f deploy/docker-compose.yml

# ── Build ─────────────────────────────────────────────────────────────────────
.PHONY: build
build: ## Build all custom services
	@for s in $(SERVICES); do echo ">> $$s"; (cd services/$$s && go build ./...); done

.PHONY: build-svc
build-svc: ## Build one service: make build-svc SVC=nrf-oauth2
	cd services/$(SVC) && go build ./...

# ── Development ───────────────────────────────────────────────────────────────
.PHONY: dev
dev: ## docker-compose up with hot-reload overrides
	$(COMPOSE) -f deploy/docker-compose.dev.yml up

.PHONY: logs
logs: ## Tail service logs: make logs SVC=anomaly-detector
	$(COMPOSE) logs -f $(SVC)

# ── Testing ───────────────────────────────────────────────────────────────────
.PHONY: test
test: ## Unit tests for all Go modules
	@for s in $(SERVICES); do (cd services/$$s && go test ./...); done
	cd pkg/jwt-middleware && go test ./...
	cd pkg/5g-types && go test ./...

.PHONY: conformance
conformance: ## Run full conformance suite against free5GC
	cd services/test-runner && go run ./cmd/cli -core free5gc ../../scenarios/standard/*.yaml

.PHONY: conformance-open5gs
conformance-open5gs: ## Run a subset against Open5GS
	cd services/test-runner && go run ./cmd/cli -core open5gs ../../scenarios/standard/TC-01.yaml ../../scenarios/standard/TC-04.yaml

# ── Security ──────────────────────────────────────────────────────────────────
.PHONY: sec-scan
sec-scan: ## Run gosec on all custom services
	@for s in $(SERVICES); do (cd services/$$s && gosec ./...); done

.PHONY: cert-status
cert-status: ## Print expiry status for all NF certificates
	./infra/pki/cfssl/init.sh status

# ── ML Pipeline ───────────────────────────────────────────────────────────────
.PHONY: train-scenarios train-model export-model
train-scenarios: ## Run UERANSIM attack scenarios and collect traces
	python training/collect.py
train-model: ## Train isolation forest on collected traces
	python training/train.py
export-model: ## Export to ONNX and copy to anomaly-detector/models/
	python training/export.py

# ── Deployment ────────────────────────────────────────────────────────────────
.PHONY: up down reset-pki
up: ## Full stack
	$(COMPOSE) up -d
down:
	$(COMPOSE) down
reset-pki: ## Regenerate all certificates
	$(COMPOSE) run --rm cfssl ./init.sh --force

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
