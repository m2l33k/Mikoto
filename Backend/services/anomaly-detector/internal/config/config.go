package config

import (
	"os"
	"time"
)

// Config holds anomaly-detector runtime configuration.
type Config struct {
	ListenAddr    string        `yaml:"listenAddr"`
	PrometheusURL string        `yaml:"prometheusUrl"`
	LokiURL       string        `yaml:"lokiUrl"`
	RedisURL      string        `yaml:"redisUrl"`
	ModelPath     string        `yaml:"modelPath"`
	PollInterval  time.Duration `yaml:"pollInterval"`
}

// Load reads configuration from environment variables.
func Load() (*Config, error) {
	return &Config{
		ListenAddr:    env("LISTEN_ADDR", ":8091"),
		PrometheusURL: env("PROMETHEUS_URL", "http://prometheus:9090"),
		LokiURL:       env("LOKI_URL", "http://loki:3100"),
		RedisURL:      env("REDIS_URL", "redis://redis:6379"),
		ModelPath:     env("MODEL_PATH", "/models/isolation_forest.onnx"),
		PollInterval:  5 * time.Second,
	}, nil
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
