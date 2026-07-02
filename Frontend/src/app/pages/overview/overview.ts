import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../ui/icon';
import { Sparkline, Gauge, AreaChart, BarChart, Series } from '../../ui/charts';
import { Toolbar } from '../../ui/toolbar';
import { genSeries, rangeBuckets, timeLabels, TimeRange } from '../../ui/data';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface NfHealth {
  nf: string;
  role: string;
  status: 'healthy' | 'degraded' | 'down';
  cpu: number;
  mem: number;
  trend: number[];
}

interface Event {
  time: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
}

/** System Overview — executive landing dashboard. */
@Component({
  selector: 'app-overview',
  imports: [RouterLink, Icon, Sparkline, Gauge, AreaChart, BarChart, Toolbar],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly times = signal<string[]>([]);
  protected readonly signalSeries = signal<Series[]>([]);
  protected readonly throughputBars = signal<number[]>([]);
  protected readonly liveView = signal(false);

  constructor() {
    this.load('1h');
  }

  protected refreshAll(): void {
    this.load('1h');
    this.toast.success('Snapshot refreshed', 'Telemetry re-polled from all network functions.');
  }

  protected exportSnapshot(): void {
    this.toast.info('Export queued', 'overview-snapshot.csv is being generated…');
  }

  protected toggleLive(): void {
    this.liveView.update((v) => !v);
    this.toast.info(
      this.liveView() ? 'Live view enabled' : 'Live view paused',
      this.liveView() ? 'Streaming 1s telemetry deltas.' : 'Dashboard frozen at last snapshot.',
    );
  }

  protected async runDiagnostics(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Run core diagnostics?',
      message: 'This runs a non-disruptive health sweep across all 8 network functions (~15s).',
      confirmLabel: 'Run diagnostics',
      cancelLabel: 'Cancel',
    });
    if (ok) {
      this.toast.success('Diagnostics started', 'Sweeping NRF, AMF, SMF, UPF and peers…');
    }
  }

  protected acknowledgeAlerts(): void {
    this.toast.warning('Alerts acknowledged', '1 critical anomaly muted for 30 minutes.');
  }

  protected inspectNf(nf: NfHealth): void {
    this.toast.info(`${nf.nf} · ${nf.role}`, `CPU ${nf.cpu}% · MEM ${nf.mem}% · ${nf.status}`);
  }

  protected inspectEvent(e: Event): void {
    this.toast.info(`${e.source} @ ${e.time}`, e.message);
  }

  protected load(range: TimeRange): void {
    const { n, step } = rangeBuckets(range);
    this.times.set(timeLabels(n, step));
    this.signalSeries.set([
      { name: 'req/s', color: 'var(--brand-accent)', data: genSeries(n, 2300, 360) },
    ]);
    this.throughputBars.set(genSeries(n, 14, 5).map((v) => Math.round(v * 10) / 10));
  }

  protected readonly nfs: NfHealth[] = [
    { nf: 'NRF', role: 'Service Registry', status: 'healthy', cpu: 12, mem: 34, trend: [10, 12, 11, 13, 12, 14, 12] },
    { nf: 'AMF', role: 'Access & Mobility', status: 'healthy', cpu: 41, mem: 58, trend: [30, 35, 40, 38, 44, 41, 43] },
    { nf: 'SMF', role: 'Session Mgmt', status: 'healthy', cpu: 28, mem: 47, trend: [22, 25, 27, 30, 28, 26, 29] },
    { nf: 'UPF', role: 'User Plane', status: 'degraded', cpu: 76, mem: 71, trend: [60, 68, 72, 70, 78, 76, 80] },
    { nf: 'AUSF', role: 'Authentication', status: 'healthy', cpu: 18, mem: 31, trend: [15, 17, 16, 19, 18, 17, 18] },
    { nf: 'UDM', role: 'Data Mgmt', status: 'healthy', cpu: 22, mem: 44, trend: [20, 22, 21, 24, 23, 22, 23] },
    { nf: 'PCF', role: 'Policy Control', status: 'healthy', cpu: 9, mem: 26, trend: [8, 9, 10, 9, 11, 9, 10] },
    { nf: 'NSSF', role: 'Slice Selection', status: 'healthy', cpu: 7, mem: 22, trend: [6, 7, 8, 7, 7, 8, 7] },
  ];

  protected readonly events: Event[] = [
    { time: '14:02:11', severity: 'critical', source: 'ML-Engine', message: 'IMSI Catcher signature detected — src 192.168.12.9' },
    { time: '13:58:40', severity: 'warning', source: 'UPF-Node-01', message: 'CPU saturation 76% sustained over 5m window' },
    { time: '13:47:02', severity: 'warning', source: 'PKI', message: 'AMF certificate enters renewal window (48h)' },
    { time: '13:31:55', severity: 'info', source: 'NRF', message: 'NF profile registered: SMF-Node-02 (nsmf-pdusession)' },
    { time: '13:20:18', severity: 'info', source: 'Vault', message: 'Dynamic DB credential leased to UDM (ttl 1h)' },
  ];
}
