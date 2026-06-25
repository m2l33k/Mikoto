package config

import "os"

// Config holds dashboard-api runtime configuration.
type Config struct {
	ListenAddr      string `yaml:"listenAddr"`
	CasdoorEndpoint string `yaml:"casdoorEndpoint"`
	CasdoorClientID string `yaml:"casdoorClientId"`
	CasdoorSecret   string `yaml:"casdoorSecret"`
	AnomalyURL      string `yaml:"anomalyUrl"`
	PrometheusURL   string `yaml:"prometheusUrl"`
	TestRunnerURL   string `yaml:"testRunnerUrl"`
	VaultAddr       string `yaml:"vaultAddr"`
}

// Load reads configuration from environment variables.
func Load() (*Config, error) {
	return &Config{
		ListenAddr:      env("LISTEN_ADDR", ":8093"),
		CasdoorEndpoint: env("CASDOOR_ENDPOINT", "http://casdoor:8000"),
		CasdoorClientID: env("CASDOOR_CLIENT_ID", "dashboard"),
		CasdoorSecret:   env("CASDOOR_CLIENT_SECRET", ""),
		AnomalyURL:      env("ANOMALY_URL", "http://anomaly-detector:8091"),
		PrometheusURL:   env("PROMETHEUS_URL", "http://prometheus:9090"),
		TestRunnerURL:   env("TEST_RUNNER_URL", "http://test-runner:8092"),
		VaultAddr:       env("VAULT_ADDR", "http://vault:8200"),
	}, nil
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
