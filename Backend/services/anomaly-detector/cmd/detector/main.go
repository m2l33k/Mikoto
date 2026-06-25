// Command detector runs the anomaly-detection engine and its API.
package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/securecode5g/anomaly-detector/internal/alerts"
	"github.com/securecode5g/anomaly-detector/internal/api"
	"github.com/securecode5g/anomaly-detector/internal/collector"
	"github.com/securecode5g/anomaly-detector/internal/config"
	"github.com/securecode5g/anomaly-detector/internal/detection"
	"github.com/securecode5g/anomaly-detector/internal/detection/ml"
	"github.com/securecode5g/anomaly-detector/internal/detection/rules"
	"github.com/securecode5g/anomaly-detector/internal/detection/statistical"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	ctx := context.Background()

	store, err := alerts.NewStore(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("redis: %v", err)
	}
	pub := alerts.NewPublisher()

	prom := collector.NewPrometheus(cfg.PrometheusURL)
	model, err := ml.LoadModel(cfg.ModelPath)
	if err != nil {
		log.Fatalf("model: %v", err)
	}
	engine := detection.NewEngine(
		rules.NewEngine(rules.DefaultRules()),
		statistical.NewDetector(),
		ml.NewInference(model, 0.5),
	)

	go detectionLoop(ctx, cfg.PollInterval, prom, engine, store, pub)

	apiSrv := api.New(store, pub)
	log.Printf("anomaly-detector API on %s", cfg.ListenAddr)
	log.Fatal(http.ListenAndServe(cfg.ListenAddr, apiSrv.Handler()))
}

func detectionLoop(ctx context.Context, every time.Duration, c *collector.Prometheus,
	e *detection.Engine, store *alerts.Store, pub *alerts.Publisher) {

	t := time.NewTicker(every)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case now := <-t.C:
			snap, err := c.Collect(ctx, now)
			if err != nil {
				log.Printf("collect: %v", err)
				continue
			}
			for _, a := range e.Evaluate(ctx, snap) {
				_ = store.Put(ctx, a)
				pub.Broadcast(a)
			}
		}
	}
}
