package api

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(*http.Request) bool { return true }, // TODO: restrict origins
}

// stream upgrades to WebSocket and serves the merged event stream.
// GET /api/v1/stream
func (s *Server) stream(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()
	// TODO: stream.Multiplexer.Run(r.Context(), conn)
}
