// Command server is the nrf-oauth2 OAuth2 authorization server entrypoint.
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/securecode5g/nrf-oauth2/internal/config"
	"github.com/securecode5g/nrf-oauth2/internal/server"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	srv := server.New(cfg)

	go func() {
		log.Printf("nrf-oauth2 listening on %s", cfg.ListenAddr)
		if err := srv.ListenAndServe(); err != nil {
			log.Printf("server stopped: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
