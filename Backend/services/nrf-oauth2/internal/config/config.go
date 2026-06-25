package config

import (
	"os"
	"time"
)

// Config holds nrf-oauth2 runtime configuration.
type Config struct {
	ListenAddr     string        `yaml:"listenAddr"`
	VaultAddr      string        `yaml:"vaultAddr"`
	NRFURL         string        `yaml:"nrfUrl"`
	MongoURI       string        `yaml:"mongoUri"`
	SigningKeyPath string        `yaml:"signingKeyPath"` // Vault KV v2 path
	TokenTTL       time.Duration `yaml:"tokenTtl"`
	Issuer         string        `yaml:"issuer"`
}

// Load reads configuration from env vars (falling back to a YAML file is TODO).
func Load() (*Config, error) {
	cfg := &Config{
		ListenAddr:     env("LISTEN_ADDR", ":8090"),
		VaultAddr:      env("VAULT_ADDR", "http://vault:8200"),
		NRFURL:         env("NRF_URL", "http://nrf:8000"),
		MongoURI:       env("MONGO_URI", "mongodb://mongodb:27017"),
		SigningKeyPath: env("SIGNING_KEY_PATH", "secret/data/nrf-oauth2/signing"),
		TokenTTL:       time.Hour,
		Issuer:         env("ISSUER", "https://nrf-oauth2:8090"),
	}
	return cfg, nil
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
