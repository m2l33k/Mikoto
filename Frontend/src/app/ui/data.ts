/**
 * Small helpers for realistic-looking telemetry mock data.
 */

export type TimeRange = '15m' | '1h' | '6h' | '24h';

/** Number of points + minutes-per-bucket for a given time range. */
export function rangeBuckets(range: TimeRange): { n: number; step: number } {
  switch (range) {
    case '15m':
      return { n: 15, step: 1 };
    case '6h':
      return { n: 24, step: 15 };
    case '24h':
      return { n: 24, step: 60 };
    case '1h':
    default:
      return { n: 20, step: 3 };
  }
}

/** Noisy series generator (fresh values each call → visible on refresh). */
export function genSeries(n: number, base: number, volatility: number, trend = 0): number[] {
  const out: number[] = [];
  let v = base + (Math.random() - 0.5) * volatility;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.5) * volatility + trend;
    v = Math.max(0, v);
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

/** Returns `count` HH:MM labels spaced `stepMin` minutes apart, ending "now". */
export function timeLabels(count: number, stepMin: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * stepMin * 60_000);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    out.push(`${hh}:${mm}`);
  }
  return out;
}
