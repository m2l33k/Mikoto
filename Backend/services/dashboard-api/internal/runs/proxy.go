package runs

import (
	"net/http"
	"net/http/httputil"
	"net/url"
)

// NewProxy reverse-proxies test-runner /api/v1/runs/latest for the dashboard.
func NewProxy(testRunnerURL string) (http.Handler, error) {
	u, err := url.Parse(testRunnerURL)
	if err != nil {
		return nil, err
	}
	return httputil.NewSingleHostReverseProxy(u), nil
}
