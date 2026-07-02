import { Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { AreaChart, Donut, Gauge, Series, Slice } from '../../ui/charts';
import { TableController, SortHeader } from '../../ui/table';
import { timeLabels } from '../../ui/data';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface CiliumPolicy {
  source: string;
  target: string;
  protocol: string;
  mode: string;
  state: 'enforced' | 'blocked';
}

interface Anomaly {
  time: string;
  sourceIp: string;
  type: string;
  severity: 'critical' | 'warning';
}

/** Persona A — SecOps Administrator Dashboard (design.txt §3.1). */
@Component({
  selector: 'app-secops',
  imports: [Icon, AreaChart, Donut, Gauge, SortHeader],
  templateUrl: './secops.html',
  styleUrl: './secops.css',
})
export class Secops {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly times = timeLabels(24, 5); // last 2h, 5-min steps

  /** Blocked-vs-allowed SBI signalling — the security telemetry the admin watches. */
  protected readonly threatSeries: Series[] = [
    {
      name: 'Blocked flows/min',
      color: 'var(--brand-danger)',
      data: [1, 0, 2, 1, 0, 1, 3, 2, 1, 4, 2, 3, 1, 2, 5, 8, 6, 3, 2, 1, 2, 1, 0, 1],
    },
    {
      name: 'Policy verdicts/min',
      color: 'var(--brand-accent)',
      dashed: true,
      data: [
        42, 45, 41, 47, 44, 46, 43, 48, 45, 44, 46, 49, 45, 47, 44, 51, 48, 45, 46, 44, 45, 47, 44,
        46,
      ],
    },
  ];

  protected readonly policySource = signal(this.seedPolicies());
  /** Sortable zero-trust policy table. */
  protected readonly table = new TableController(this.policySource, [
    'source',
    'target',
    'protocol',
  ]);

  private seedPolicies(): CiliumPolicy[] {
    return [
      {
        source: 'AMF-Node-01',
        target: 'SMF-Node-01',
        protocol: 'HTTP/2 (SBI)',
        mode: 'eBPF Layer-7 Ruleset',
        state: 'enforced',
      },
      {
        source: 'AMF-Node-01',
        target: 'UPF-Node-01',
        protocol: 'GTP-U/SCTP',
        mode: 'Blocked by Default',
        state: 'blocked',
      },
      {
        source: 'SMF-Node-01',
        target: 'UDM-Node-01',
        protocol: 'HTTP/2 (SBI)',
        mode: 'eBPF Layer-7 Ruleset',
        state: 'enforced',
      },
      {
        source: 'SMF-Node-01',
        target: 'UPF-Node-01',
        protocol: 'PFCP (N4)',
        mode: 'eBPF Layer-7 Ruleset',
        state: 'enforced',
      },
      {
        source: '10.10.9.4 (unknown)',
        target: 'NRF-Node-01',
        protocol: 'HTTP/2 (SBI)',
        mode: 'Default-Deny',
        state: 'blocked',
      },
    ];
  }

  protected readonly anomalies = signal<Anomaly[]>([
    {
      time: '14:02 UTC',
      sourceIp: '192.168.12.9',
      type: 'IMSI Catcher Emulator',
      severity: 'critical',
    },
    {
      time: '13:47 UTC',
      sourceIp: '10.44.2.17',
      type: 'Signaling Flood (NAS)',
      severity: 'warning',
    },
  ]);

  /** Live anomaly severity split for the donut. */
  protected readonly severityMix = computed<Slice[]>(() => {
    const a = this.anomalies();
    const count = (s: Anomaly['severity']) => a.filter((x) => x.severity === s).length;
    return [
      { name: 'Critical', value: count('critical'), color: 'var(--brand-danger)' },
      { name: 'Warning', value: count('warning'), color: 'var(--brand-warning)' },
      { name: 'Nominal', value: Math.max(1, 6 - a.length), color: 'var(--brand-success)' },
    ];
  });

  protected readonly openCount = computed(() => this.anomalies().length);

  protected async mitigate(a: Anomaly): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Mitigate attack stream?',
      message: `Quarantine ${a.sourceIp} and block the offending signalling flow via Cilium eBPF policy.`,
      confirmLabel: 'Mitigate now',
      danger: true,
    });
    if (!ok) return;
    this.anomalies.update((list) => list.filter((x) => x !== a));
    this.toast.success('Attack stream mitigated', `${a.type} from ${a.sourceIp} blocked.`);
  }
}
