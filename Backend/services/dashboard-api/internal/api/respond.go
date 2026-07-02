package api

import (
	"encoding/json"
	"log"
	"net/http"
)

// writeJSON encodes v as the response body with the given status.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("respond: encode: %v", err)
	}
}

// writeErr emits the standard error envelope: {"error":{"code","message"}}.
func writeErr(w http.ResponseWriter, status int, code, message string) {
	var e APIError
	e.Error.Code = code
	e.Error.Message = message
	writeJSON(w, status, e)
}

// decodeJSON parses the request body into v; replies 400 and returns false on
// malformed input.
func decodeJSON(w http.ResponseWriter, r *http.Request, v any) bool {
	if err := json.NewDecoder(r.Body).Decode(v); err != nil {
		writeErr(w, http.StatusBadRequest, "MALFORMED_BODY", "invalid JSON body")
		return false
	}
	return true
}
