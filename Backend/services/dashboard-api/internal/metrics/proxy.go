package metrics

import (
	"net/http"
	"net/http/httputil"
	"net/url"
)

// NewProxy reverse-proxies Prometheus /api/v1/query_range for the dashboard.
func NewProxy(prometheusURL string) (http.Handler, error) {
	u, err := url.Parse(prometheusURL)
	if err != nil {
		return nil, err
	}
	return httputil.NewSingleHostReverseProxy(u), nil
}
