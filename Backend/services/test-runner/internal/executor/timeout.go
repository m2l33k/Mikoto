package executor

import (
	"context"
	"time"
)

// withDeadline runs fn under a per-step deadline. A zero max means no deadline.
func withDeadline(ctx context.Context, max time.Duration, fn func(context.Context) error) error {
	if max <= 0 {
		return fn(ctx)
	}
	ctx, cancel := context.WithTimeout(ctx, max)
	defer cancel()
	return fn(ctx)
}
