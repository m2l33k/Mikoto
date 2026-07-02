import { Component, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Gauge } from '../../ui/charts';
import { StackedBar, StackSeries, HBar, HBarItem } from '../../ui/charts-extra';
import { timeLabels } from '../../ui/data';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface Slice {
  snssai: string;
  type: string;
  dnn: string;
  sessions: number;
  slaLatency: string;
  utilisation: number;
  status: 'active' | 'degraded' | 'disabled';
}

/** Network Slicing (NSSF) — slice selection, SLA & utilisation. */
@Component({
  selector: 'app-slicing',
  imports: [Icon, Gauge, StackedBar, HBar],
  templateUrl: './slicing.html',
  styleUrl: './slicing.css',
})
export class Slicing {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly times = timeLabels(8, 30);

  protected readonly trafficSeries: StackSeries[] = [
    { name: 'eMBB', color: 'var(--brand-accent)', data: [62, 70, 58, 81, 74, 90, 68, 77] },
    { name: 'URLLC', color: 'var(--brand-warning)', data: [18, 22, 16, 28, 24, 30, 21, 26] },
    { name: 'mMTC', color: 'var(--brand-success)', data: [9, 11, 8, 13, 10, 14, 9, 12] },
  ];

  protected readonly throughput: HBarItem[] = [
    { label: 'eMBB (01-000001)', value: 11200, color: 'var(--brand-accent)', unit: ' Mbps' },
    { label: 'URLLC (02-000002)', value: 2400, color: 'var(--brand-warning)', unit: ' Mbps' },
    { label: 'mMTC (03-000003)', value: 410, color: 'var(--brand-success)', unit: ' Mbps' },
  ];

  protected readonly slices = signal<Slice[]>([
    {
      snssai: '01-000001',
      type: 'eMBB',
      dnn: 'internet',
      sessions: 1042,
      slaLatency: '≤ 20ms',
      utilisation: 71,
      status: 'active',
    },
    {
      snssai: '02-000002',
      type: 'URLLC',
      dnn: 'ims',
      sessions: 188,
      slaLatency: '≤ 5ms',
      utilisation: 88,
      status: 'degraded',
    },
    {
      snssai: '03-000003',
      type: 'mMTC',
      dnn: 'iot',
      sessions: 54,
      slaLatency: '≤ 100ms',
      utilisation: 23,
      status: 'active',
    },
  ]);

  protected async toggle(s: Slice): Promise<void> {
    const disabling = s.status !== 'disabled';
    const ok = await this.confirm.ask({
      title: disabling ? `Disable slice ${s.type}?` : `Enable slice ${s.type}?`,
      message: disabling
        ? `NSSF will stop selecting S-NSSAI ${s.snssai}; new UEs are routed to fallback slices.`
        : `NSSF will resume selecting S-NSSAI ${s.snssai}.`,
      confirmLabel: disabling ? 'Disable' : 'Enable',
      danger: disabling,
    });
    if (!ok) return;
    const next: Slice['status'] = disabling ? 'disabled' : 'active';
    this.slices.update((list) =>
      list.map((x) => (x.snssai === s.snssai ? { ...x, status: next } : x)),
    );
    this.toast.success(disabling ? 'Slice disabled' : 'Slice enabled', `${s.type} · ${s.snssai}`);
  }
}
