// Command api serves the security dashboard backend.
package main

import (
	"context"
	"log"
	"net/http"

	"github.com/securecode5g/dashboard-api/internal/alerts"
	"github.com/securecode5g/dashboard-api/internal/api"
	"github.com/securecode5g/dashboard-api/internal/auth"
	"github.com/securecode5g/dashboard-api/internal/config"
	"github.com/securecode5g/dashboard-api/internal/metrics"
	"github.com/securecode5g/dashboard-api/internal/runs"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	ctx := context.Background()

	casdoor, err := auth.NewCasdoor(ctx, cfg.CasdoorEndpoint, cfg.CasdoorClientID,
		cfg.CasdoorSecret, "http://localhost:8093/auth/callback")
	if err != nil {
		log.Fatalf("casdoor: %v", err)
	}

	alertsProxy, err := alerts.NewProxy(cfg.AnomalyURL)
	if err != nil {
		log.Fatalf("alerts proxy: %v", err)
	}
	metricsProxy, err := metrics.NewProxy(cfg.PrometheusURL)
	if err != nil {
		log.Fatalf("metrics proxy: %v", err)
	}
	runsProxy, err := runs.NewProxy(cfg.TestRunnerURL)
	if err != nil {
		log.Fatalf("runs proxy: %v", err)
	}

	srv := api.New(auth.NewMiddleware(casdoor), api.Deps{
		AlertsProxy:  alertsProxy,
		MetricsProxy: metricsProxy,
		RunsProxy:    runsProxy,
	})

	log.Printf("dashboard-api on %s", cfg.ListenAddr)
	log.Fatal(http.ListenAndServe(cfg.ListenAddr, srv.Handler()))
}
