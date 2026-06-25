package capture

import (
	"context"
	"path/filepath"
)

// Capture controls a tcpdump sidecar, one pcap per test case.
type Capture struct {
	dir string
}

// New builds a Capture writing pcaps under dir.
func New(dir string) *Capture { return &Capture{dir: dir} }

// Start begins capturing for a test case and returns the output path.
func (c *Capture) Start(ctx context.Context, runID, tc string) (string, error) {
	out := filepath.Join(c.dir, runID, tc+".pcap")
	// TODO: exec tcpdump (or signal sidecar) to write to out.
	_ = ctx
	return out, nil
}

// Stop ends the capture for a test case.
func (c *Capture) Stop(ctx context.Context, runID, tc string) error {
	// TODO: stop tcpdump for this tc.
	_, _, _ = ctx, runID, tc
	return nil
}
