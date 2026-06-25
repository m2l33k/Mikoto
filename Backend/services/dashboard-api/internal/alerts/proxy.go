package alerts

import (
	"net/http"
	"net/http/httputil"
	"net/url"
)

// NewProxy reverse-proxies /api/v1/alerts to the anomaly-detector.
func NewProxy(anomalyURL string) (http.Handler, error) {
	u, err := url.Parse(anomalyURL)
	if err != nil {
		return nil, err
	}
	return httputil.NewSingleHostReverseProxy(u), nil
}
