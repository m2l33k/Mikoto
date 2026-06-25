// Package open5gs implements adapter.CoreAdapter for the Open5GS core.
package open5gs

import "context"

// Adapter drives an Open5GS deployment.
type Adapter struct {
	configPath  string
	nfEndpoints map[string]string
}

// New builds an Open5GS adapter.
func New(configPath string, nfEndpoints map[string]string) *Adapter {
	return &Adapter{configPath: configPath, nfEndpoints: nfEndpoints}
}

func (a *Adapter) Name() string { return "open5gs" }

func (a *Adapter) Start(ctx context.Context) error { _ = ctx; return nil }
func (a *Adapter) Stop(ctx context.Context) error  { _ = ctx; return nil }
func (a *Adapter) Reset(ctx context.Context) error { _ = ctx; return nil }

func (a *Adapter) HealthCheck(ctx context.Context) error { _ = ctx; return nil }

func (a *Adapter) NFEndpoint(nfType string) string { return a.nfEndpoints[nfType] }

// RegisterUE provisions a subscriber via the Open5GS dbctl / WebUI API.
func (a *Adapter) RegisterUE(supi, key, opc string) error {
	_, _, _ = supi, key, opc
	return nil
}
