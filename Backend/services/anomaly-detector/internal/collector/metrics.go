package collector

import "time"

// Snapshot is an internal point-in-time view of 5GC metrics used by all
// detection phases.
type Snapshot struct {
	Timestamp        time.Time
	RegistrationRate float64 // registrations/sec
	AuthFailureRate  float64 // AKA failures/sec
	PDUSessionCount  float64
	HeartbeatMisses  float64
	NASMsgRates      map[string]float64 // NAS message type -> rate
	PerNFLatencyP95  map[string]float64 // nfType -> p95 ms
}
