import { Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Donut, Slice } from '../../ui/charts';
import { Heatmap, HeatRow } from '../../ui/charts-extra';
import { TableController, SortHeader } from '../../ui/table';
import { timeLabels } from '../../ui/data';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';
import { downloadCsv } from '../../core/csv';

type Severity = 'critical' | 'major' | 'minor';
type State = 'active' | 'acked' | 'cleared';

interface Alarm {
  id: string;
  time: string;
  severity: Severity;
  source: string;
  summary: string;
  state: State;
}

/** Alarms Center — consolidated fault management with ack/clear. */
@Component({
  selector: 'app-alarms',
  imports: [Icon, Donut, Heatmap, SortHeader],
  templateUrl: './alarms.html',
  styleUrl: './alarms.css',
})
export class Alarms {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly hours = timeLabels(8, 60);

  protected readonly heat: HeatRow[] = [
    { label: 'Critical', values: [0, 1, 0, 0, 1, 2, 1, 1] },
    { label: 'Major', values: [1, 2, 1, 3, 2, 4, 3, 2] },
    { label: 'Minor', values: [3, 4, 5, 4, 6, 5, 7, 4] },
  ];

  protected readonly alarms = signal<Alarm[]>([
    {
      id: 'ALM-4471',
      time: '14:02:11',
      severity: 'critical',
      source: 'ML-Engine',
      summary: 'IMSI Catcher signature detected (192.168.12.9)',
      state: 'active',
    },
    {
      id: 'ALM-4468',
      time: '13:58:40',
      severity: 'major',
      source: 'UPF-Node-01',
      summary: 'CPU saturation 76% sustained > 5m',
      state: 'active',
    },
    {
      id: 'ALM-4465',
      time: '13:47:02',
      severity: 'major',
      source: 'PKI',
      summary: 'AMF certificate expires in 48h',
      state: 'acked',
    },
    {
      id: 'ALM-4460',
      time: '13:31:55',
      severity: 'minor',
      source: 'NSSF-Node-01',
      summary: 'NF heartbeat late (38s)',
      state: 'active',
    },
    {
      id: 'ALM-4452',
      time: '12:55:09',
      severity: 'major',
      source: 'Cilium',
      summary: 'Spike in dropped flows (default-deny)',
      state: 'cleared',
    },
    {
      id: 'ALM-4441',
      time: '12:10:33',
      severity: 'minor',
      source: 'Prometheus',
      summary: 'Scrape target nssf down',
      state: 'active',
    },
  ]);

  /** Sortable fault list (severity/state triage is the primary workflow). */
  protected readonly table = new TableController(this.alarms, ['id', 'source', 'summary']);

  protected readonly severityMix = computed<Slice[]>(() => {
    const a = this.alarms().filter((x) => x.state !== 'cleared');
    const count = (s: Severity) => a.filter((x) => x.severity === s).length;
    return [
      { name: 'Critical', value: count('critical'), color: 'var(--brand-danger)' },
      { name: 'Major', value: count('major'), color: 'var(--brand-warning)' },
      { name: 'Minor', value: count('minor'), color: 'var(--brand-accent)' },
    ];
  });

  protected readonly counts = computed(() => {
    const a = this.alarms();
    return {
      critical: a.filter((x) => x.severity === 'critical' && x.state !== 'cleared').length,
      major: a.filter((x) => x.severity === 'major' && x.state !== 'cleared').length,
      minor: a.filter((x) => x.severity === 'minor' && x.state !== 'cleared').length,
      cleared: a.filter((x) => x.state === 'cleared').length,
    };
  });

  protected exportCsv(): void {
    downloadCsv(
      'alarms',
      ['ID', 'Time', 'Severity', 'Source', 'Summary', 'State'],
      this.alarms().map((a) => [a.id, a.time, a.severity, a.source, a.summary, a.state]),
    );
    this.toast.success('Export ready', 'alarms.csv downloaded.');
  }

  protected ack(a: Alarm): void {
    this.alarms.update((list) => list.map((x) => (x.id === a.id ? { ...x, state: 'acked' } : x)));
    this.toast.info('Alarm acknowledged', `${a.id} · ${a.source}`);
  }

  protected async clear(a: Alarm): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Clear ${a.id}?`,
      message: `Mark "${a.summary}" as resolved and remove it from the active fault list.`,
      confirmLabel: 'Clear alarm',
    });
    if (!ok) return;
    this.alarms.update((list) => list.map((x) => (x.id === a.id ? { ...x, state: 'cleared' } : x)));
    this.toast.success('Alarm cleared', a.id);
  }
}
