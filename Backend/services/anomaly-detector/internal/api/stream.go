package api

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(*http.Request) bool { return true }, // TODO: restrict origins
}

// stream upgrades to WebSocket and streams alerts to the client.
// WS /api/v1/stream
func (s *Server) stream(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	ch := s.pub.Subscribe()
	defer s.pub.Unsubscribe(ch)

	for a := range ch {
		if err := conn.WriteJSON(a); err != nil {
			return
		}
	}
}
