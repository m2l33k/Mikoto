package statistical

import (
	"gonum.org/v1/gonum/stat"
)

// ZScore returns the standard score of v against the window values. Callers
// typically flag |z| > 3 as an outlier.
func ZScore(window []float64, v float64) float64 {
	if len(window) < 2 {
		return 0
	}
	mean, std := stat.MeanStdDev(window, nil)
	if std == 0 {
		return 0
	}
	return (v - mean) / std
}
