import { Component, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { AreaChart, BarChart, Donut, Series, Slice } from '../../ui/charts';
import { Toolbar } from '../../ui/toolbar';
import { genSeries, rangeBuckets, timeLabels, TimeRange } from '../../ui/data';

interface Target {
  job: string;
  instance: string;
  scrape: string;
  up: boolean;
}
interface NfLoad {
  nf: string;
  cpu: number;
  mem: number;
}

/** Observability — Prometheus/Grafana-style metrics with live refresh. */
@Component({
  selector: 'app-observability',
  imports: [Icon, AreaChart, BarChart, Donut, Toolbar],
  templateUrl: './observability.html',
  styleUrl: './observability.css',
})
export class Observability {
  protected readonly times = signal<string[]>([]);
  protected readonly reqRate = signal<Series[]>([]);
  protected readonly latency = signal<Series[]>([]);
  protected readonly errBars = signal<number[]>([]);

  // Static reference data
  protected readonly statusMix: Slice[] = [
    { name: '2xx Success', value: 1_842_310, color: 'var(--brand-success)' },
    { name: '3xx Redirect', value: 41_280, color: 'var(--brand-accent)' },
    { name: '4xx Client', value: 12_905, color: 'var(--brand-warning)' },
    { name: '5xx Server', value: 742, color: 'var(--brand-danger)' },
  ];
  protected readonly nfLoad: NfLoad[] = [
    { nf: 'AMF', cpu: 41, mem: 58 },
    { nf: 'SMF', cpu: 28, mem: 47 },
    { nf: 'UPF', cpu: 76, mem: 71 },
    { nf: 'AUSF', cpu: 18, mem: 31 },
    { nf: 'UDM', cpu: 22, mem: 44 },
    { nf: 'NRF', cpu: 12, mem: 34 },
  ];
  protected readonly targets: Target[] = [
    { job: 'amf', instance: '10.10.1.11:9090', scrape: '1.2s ago', up: true },
    { job: 'smf', instance: '10.10.1.21:9090', scrape: '0.8s ago', up: true },
    { job: 'upf', instance: '10.10.2.31:9090', scrape: '1.0s ago', up: true },
    { job: 'ausf', instance: '10.10.1.41:9090', scrape: '2.1s ago', up: true },
    { job: 'udm', instance: '10.10.1.51:9090', scrape: '0.9s ago', up: true },
    { job: 'nssf', instance: '10.10.1.71:9090', scrape: '38s ago', up: false },
  ];

  constructor() {
    this.load('1h');
  }

  protected load(range: TimeRange): void {
    const { n, step } = rangeBuckets(range);
    this.times.set(timeLabels(n, step));

    this.reqRate.set([
      { name: 'req/s', color: 'var(--brand-accent)', data: genSeries(n, 2300, 380) },
    ]);

    const p50 = genSeries(n, 44, 14);
    this.latency.set([
      { name: 'p50', color: 'var(--brand-success)', data: p50 },
      {
        name: 'p95',
        color: 'var(--brand-warning)',
        data: p50.map((v) => Math.round(v * 2.4 + Math.random() * 12)),
      },
      {
        name: 'p99',
        color: 'var(--brand-danger)',
        data: p50.map((v) => Math.round(v * 4.6 + Math.random() * 26)),
      },
    ]);

    this.errBars.set(genSeries(n, 1.4, 4).map((v) => Math.max(0, Math.round(v))));
  }
}
