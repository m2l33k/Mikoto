// Command runner serves the test-runner API.
package main

import (
	"log"
	"net/http"

	"github.com/securecode5g/test-runner/internal/api"
	"github.com/securecode5g/test-runner/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	srv := api.New()
	log.Printf("test-runner API on %s", cfg.ListenAddr)
	log.Fatal(http.ListenAndServe(cfg.ListenAddr, srv.Handler()))
}
