package statistical

import (
	"context"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/securecode5g/anomaly-detector/internal/alerts"
	"github.com/securecode5g/anomaly-detector/internal/collector"
)

// Detector is detection phase 2: z-score + IQR over rolling windows.
type Detector struct {
	regRate *Window
}

// NewDetector builds the statistical detector with 1h rolling windows.
func NewDetector() *Detector {
	return &Detector{regRate: NewWindow(time.Hour)}
}

// Name implements detection.Phase.
func (d *Detector) Name() string { return "statistical" }

// Evaluate updates the rolling windows and flags outliers.
func (d *Detector) Evaluate(_ context.Context, snap *collector.Snapshot) ([]alerts.Alert, error) {
	hist := d.regRate.Values()
	d.regRate.Add(snap.Timestamp, snap.RegistrationRate)

	z := ZScore(hist, snap.RegistrationRate)
	if math.Abs(z) > 3 || IQROutlier(hist, snap.RegistrationRate) {
		return []alerts.Alert{{
			ID:       uuid.NewString(),
			Severity: alerts.SeverityWarning,
			Type:     "registration_rate_outlier",
			Signal:   alerts.SignalStatistical,
			Evidence: map[string]any{"zscore": z, "value": snap.RegistrationRate},
			TS:       time.Now(),
		}}, nil
	}
	return nil, nil
}
