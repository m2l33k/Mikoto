package nrf

import (
	"context"
	"errors"
	"net/http"
	"time"
)

// ErrNFNotRegistered indicates the NF instance is unknown to the NRF.
var ErrNFNotRegistered = errors.New("nrf: NF instance not registered")

// Client talks to the free5GC NRF management API.
type Client struct {
	baseURL string
	http    *http.Client
}

// NewClient builds an NRF client for the given base URL.
func NewClient(baseURL string) *Client {
	return &Client{baseURL: baseURL, http: &http.Client{Timeout: 5 * time.Second}}
}

// VerifyRegistered hits GET /nnrf-nfm/v1/nf-instances/{id} and rejects unknown
// or non-REGISTERED instances before a token is issued.
func (c *Client) VerifyRegistered(ctx context.Context, nfInstanceID string) error {
	// TODO: GET c.baseURL + "/nnrf-nfm/v1/nf-instances/" + nfInstanceID,
	//       decode NFProfile, require nfStatus == REGISTERED.
	_, _ = ctx, nfInstanceID
	return ErrNFNotRegistered
}
