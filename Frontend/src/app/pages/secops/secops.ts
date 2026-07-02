import { Component, inject, signal } from '@angular/core';
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
  templateUrl: './secops.html',
  styleUrl: './secops.css',
})
export class Secops {
  protected readonly policies: CiliumPolicy[] = [
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
  ];

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

  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

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
