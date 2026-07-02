import { Component, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { ToastService } from '../../core/toast.service';

interface Template {
  id: string;
  name: string;
  standard: string;
  description: string;
}
interface Report {
  name: string;
  type: string;
  period: string;
  format: string;
  size: string;
  status: 'ready' | 'generating';
}

/** Reports & Export — compliance / conformance report generation. */
@Component({
  selector: 'app-reports',
  imports: [Icon],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  private readonly toast = inject(ToastService);

  protected readonly templates: Template[] = [
    { id: 'compliance', name: 'Zero-Trust Compliance', standard: '3GPP TS 33.501', description: 'mTLS coverage, token audit, CSFLE posture' },
    { id: 'conformance', name: 'Conformance Results', standard: '3GPP TS 23.502', description: 'TC-01…PERF-02 pass/fail with pcap refs' },
    { id: 'security', name: 'Security Posture', standard: 'Internal', description: 'Certs, policies, anomalies, vault status' },
    { id: 'sla', name: 'SLA & Availability', standard: 'Operational', description: 'Per-slice latency, uptime, KPI breaches' },
  ];

  protected readonly reports = signal<Report[]>([
    { name: 'TS33501-compliance-2026-06-29', type: 'Compliance', period: '2026-06-29', format: 'PDF', size: '1.8 MB', status: 'ready' },
    { name: 'TS23502-conformance-w26', type: 'Conformance', period: 'Week 26', format: 'PDF', size: '2.4 MB', status: 'ready' },
    { name: 'security-posture-2026-06-28', type: 'Security', period: '2026-06-28', format: 'CSV', size: '312 KB', status: 'ready' },
  ]);

  protected generate(t: Template, format: 'PDF' | 'CSV'): void {
    const name = `${t.id}-${new Date().toISOString().slice(0, 10)}`;
    this.reports.update((list) => [
      { name, type: t.name, period: 'now', format, size: '—', status: 'generating' },
      ...list,
    ]);
    this.toast.info('Report queued', `${t.name} (${format}) generating…`);
    setTimeout(() => {
      this.reports.update((list) =>
        list.map((r) =>
          r.name === name ? { ...r, status: 'ready', size: format === 'PDF' ? '1.9 MB' : '288 KB' } : r,
        ),
      );
      this.toast.success('Report ready', `${name}.${format.toLowerCase()}`);
    }, 1800);
  }

  protected download(r: Report): void {
    this.toast.success('Download started', `${r.name}.${r.format.toLowerCase()}`);
  }
}
