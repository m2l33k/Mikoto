package config

import "os"

// Config holds test-runner runtime configuration.
type Config struct {
	ListenAddr         string `yaml:"listenAddr"`
	ScenariosDir       string `yaml:"scenariosDir"`
	Free5GCNRFURL      string `yaml:"free5gcNrfUrl"`
	AnomalyDetectorURL string `yaml:"anomalyDetectorUrl"`
	PcapDir            string `yaml:"pcapDir"`
}

// Load reads configuration from environment variables.
func Load() (*Config, error) {
	return &Config{
		ListenAddr:         env("LISTEN_ADDR", ":8092"),
		ScenariosDir:       env("SCENARIOS_DIR", "/scenarios"),
		Free5GCNRFURL:      env("FREE5GC_NRF_URL", "http://nrf:8000"),
		AnomalyDetectorURL: env("ANOMALY_DETECTOR_URL", "http://anomaly-detector:8091"),
		PcapDir:            env("PCAP_DIR", "/var/lib/test-runner/pcap"),
	}, nil
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
