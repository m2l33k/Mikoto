package scenario

import "time"

// Scenario is a parsed conformance test scenario (3GPP TS 23.502).
type Scenario struct {
	ID          string `yaml:"id"`          // e.g. "TC-01"
	Name        string `yaml:"name"`
	Category    string `yaml:"category"`    // standard | security | fault | performance
	Description string `yaml:"description"`
	Steps       []Step `yaml:"steps"`
}

// Step is a single action plus its assertions.
type Step struct {
	Name        string            `yaml:"name"`
	Action      string            `yaml:"action"`      // e.g. "register-ue", "send-nas"
	Params      map[string]string `yaml:"params"`
	Assertions  []Assertion       `yaml:"assertions"`
	Timing      *TimingConstraint `yaml:"timing,omitempty"`
}

// Assertion checks a condition after a step executes.
type Assertion struct {
	Type     string `yaml:"type"`     // e.g. "metric", "nas-message", "alert"
	Target   string `yaml:"target"`
	Operator string `yaml:"operator"` // eq | lt | gt | contains
	Expected string `yaml:"expected"`
}

// TimingConstraint enforces a per-step deadline.
type TimingConstraint struct {
	MaxDuration time.Duration `yaml:"maxDuration"`
}
