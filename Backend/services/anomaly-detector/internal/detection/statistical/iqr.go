package statistical

import (
	"sort"

	"gonum.org/v1/gonum/stat"
)

// IQROutlier reports whether v lies outside [Q1-1.5*IQR, Q3+1.5*IQR].
func IQROutlier(window []float64, v float64) bool {
	if len(window) < 4 {
		return false
	}
	xs := append([]float64(nil), window...)
	sort.Float64s(xs)
	q1 := stat.Quantile(0.25, stat.Empirical, xs, nil)
	q3 := stat.Quantile(0.75, stat.Empirical, xs, nil)
	iqr := q3 - q1
	lo := q1 - 1.5*iqr
	hi := q3 + 1.5*iqr
	return v < lo || v > hi
}
