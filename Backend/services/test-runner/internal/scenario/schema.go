package scenario

// ValidateSchema validates raw scenario YAML against the JSON Schema.
func ValidateSchema(raw []byte) error {
	// TODO: embed scenario JSON Schema and validate (e.g. santhosh-tekuri/jsonschema).
	_ = raw
	return nil
}
