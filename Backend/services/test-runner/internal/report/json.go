package report

import (
	"encoding/json"
	"io"
)

// WriteJSON serializes a report as indented JSON.
func WriteJSON(w io.Writer, r TestRunReport) error {
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	return enc.Encode(r)
}
