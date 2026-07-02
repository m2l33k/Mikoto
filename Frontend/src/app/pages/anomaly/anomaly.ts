import { Component, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Sparkline, AreaChart, Series } from '../../ui/charts';
import { timeLabels } from '../../ui/data';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface ThreatModel {
  name: string;
  signal: string;
  method: string;
  status: 'armed' | 'triggered';
  hits: number;
}
interface Alert {
  time: string;
  threat: string;
  source: string;
  score: string;
  severity: 'critical' | 'warning' | 'info';
  state: 'open' | 'mitigated';
}

/** Anomaly Detection Engine — rule-based + statistical signalling analysis. */
@Component({
  selector: 'app-anomaly',
  imports: [Icon, Sparkline, AreaChart],
  templateUrl: './anomaly.html',
  styleUrl: './anomaly.css',
})
export class Anomaly {
  protected readonly registrationTrend = [
    8, 9, 7, 10, 9, 11, 8, 9, 12, 10, 9, 38, 41, 36, 12, 9,
  ];

  protected readonly detectTimes = timeLabels(40, 3); // last 2h, 3-min steps

  // Registration rate with a clear burst, plotted against the adaptive
  // Z-score detection threshold — this is what fired the open alert.
  protected readonly detectSeries: Series[] = [
    {
      name: 'Registrations/min',
      color: 'var(--brand-accent)',
      data: [
        9, 11, 8, 10, 12, 9, 11, 10, 8, 12, 9, 11, 10, 13, 9, 11, 8, 10, 12, 9,
        10, 11, 9, 12, 10, 9, 11, 47, 58, 52, 41, 33, 14, 10, 9, 11, 10, 12, 9, 10,
      ],
    },
    {
      name: 'Detection threshold',
      color: 'var(--brand-danger)',
      dashed: true,
      data: [
        24, 24, 23, 24, 25, 24, 24, 24, 23, 25, 24, 24, 24, 26, 24, 24, 23, 24,
        25, 24, 24, 24, 24, 25, 24, 24, 24, 26, 28, 29, 28, 27, 26, 25, 24, 24,
        24, 25, 24, 24,
      ],
    },
  ];

  protected readonly threats: ThreatModel[] = [
    { name: 'Rogue UE / IMSI Enumeration', signal: 'Registration burst from single origin', method: 'Rate threshold + Z-score', status: 'triggered', hits: 1 },
    { name: 'IMSI Catcher (Fake gNB)', signal: 'Auth without AKA, identity request', method: 'NAS sequence FSM', status: 'triggered', hits: 1 },
    { name: 'Session Hijacking', signal: 'Modify for unknown SMF session', method: 'Cross-NF state correlation', status: 'armed', hits: 0 },
    { name: 'DoS on AMF', signal: 'Registration flood per PLMN/TA', method: 'Sliding-window rate limiter', status: 'armed', hits: 0 },
  ];

  protected readonly alerts = signal<Alert[]>([
    { time: '14:02:11', threat: 'IMSI Catcher Emulator', source: '192.168.12.9', score: 'z=6.4', severity: 'critical', state: 'open' },
    { time: '13:47:02', threat: 'IMSI Enumeration', source: '10.44.2.17', score: 'z=4.1', severity: 'warning', state: 'open' },
    { time: '12:30:44', threat: 'Registration Spike', source: 'TA-0x1A2B', score: 'z=3.2', severity: 'warning', state: 'mitigated' },
    { time: '11:05:18', threat: 'Abnormal PDU Rate', source: 'SMF-Node-02', score: 'z=2.9', severity: 'info', state: 'mitigated' },
  ]);

  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected async mitigate(a: Alert): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Mitigate attack stream?',
      message: `Push a Cilium drop policy and quarantine source ${a.source}. This isolates the offending peer at the eBPF datapath.`,
      confirmLabel: 'Mitigate now',
      danger: true,
    });
    if (!ok) return;
    this.alerts.update((list) =>
      list.map((x) => (x === a ? { ...x, state: 'mitigated' } : x)),
    );
    this.toast.success('Threat mitigated', `${a.threat} — ${a.source} quarantined.`);
  }
}
