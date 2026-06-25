package api

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(*http.Request) bool { return true }, // TODO: restrict origins
}

// stream pushes live step results for a run.
// WS /api/v1/runs/{id}/stream
func (s *Server) stream(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()
	// TODO: subscribe to the run's result channel and forward StepResults.
}
