// Package free5gc implements adapter.CoreAdapter for the free5GC core.
package free5gc

import "context"

// Adapter drives a free5GC deployment.
type Adapter struct {
	configPath  string
	nfEndpoints map[string]string // nfType -> SBI URL
}

// New builds a free5GC adapter from a config path and NF endpoint map.
func New(configPath string, nfEndpoints map[string]string) *Adapter {
	return &Adapter{configPath: configPath, nfEndpoints: nfEndpoints}
}

func (a *Adapter) Name() string { return "free5gc" }

func (a *Adapter) Start(ctx context.Context) error { _ = ctx; return nil } // TODO: bring up NFs
func (a *Adapter) Stop(ctx context.Context) error  { _ = ctx; return nil }
func (a *Adapter) Reset(ctx context.Context) error { _ = ctx; return nil } // TODO: flush Mongo state

func (a *Adapter) HealthCheck(ctx context.Context) error { _ = ctx; return nil }

func (a *Adapter) NFEndpoint(nfType string) string { return a.nfEndpoints[nfType] }

// RegisterUE provisions a subscriber in the UDR/UDM.
func (a *Adapter) RegisterUE(supi, key, opc string) error {
	// TODO: POST subscriber to free5GC webconsole / UDR API.
	_, _, _ = supi, key, opc
	return nil
}
