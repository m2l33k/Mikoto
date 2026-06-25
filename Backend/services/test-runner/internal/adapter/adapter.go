package adapter

import "context"

// CoreAdapter abstracts a 5G core under test. Adding a new core only requires
// implementing this interface — scenarios and the executor are unchanged.
type CoreAdapter interface {
	Name() string
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
	Reset(ctx context.Context) error
	HealthCheck(ctx context.Context) error
	NFEndpoint(nfType string) string // SBI endpoint URL for a given NF
	RegisterUE(supi, key, opc string) error
}
