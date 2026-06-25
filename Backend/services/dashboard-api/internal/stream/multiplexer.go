package stream

import (
	"context"

	"github.com/gorilla/websocket"
)

// Multiplexer merges upstream WebSocket streams (anomaly-detector + test-runner)
// into a single client stream.
type Multiplexer struct {
	anomalyWS    string
	testRunnerWS string
}

// NewMultiplexer builds a multiplexer over the two upstream WS endpoints.
func NewMultiplexer(anomalyWS, testRunnerWS string) *Multiplexer {
	return &Multiplexer{anomalyWS: anomalyWS, testRunnerWS: testRunnerWS}
}

// Run dials both upstreams and forwards their messages to the client conn until
// the context is cancelled or the client disconnects.
func (m *Multiplexer) Run(ctx context.Context, client *websocket.Conn) error {
	// TODO: dial anomalyWS and testRunnerWS, fan-in messages, tag with source,
	//       write to client; handle reconnection/backoff.
	_, _ = ctx, client
	return nil
}
