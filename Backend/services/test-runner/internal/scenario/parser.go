package scenario

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Parse reads and validates a scenario YAML file.
func Parse(path string) (*Scenario, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read scenario: %w", err)
	}
	if err := ValidateSchema(raw); err != nil {
		return nil, fmt.Errorf("schema: %w", err)
	}
	var s Scenario
	if err := yaml.Unmarshal(raw, &s); err != nil {
		return nil, fmt.Errorf("unmarshal scenario: %w", err)
	}
	return &s, nil
}
