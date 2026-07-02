import { Component, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Sparkline } from '../../ui/charts';
import { Drawer } from '../../ui/drawer';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface PduSession {
  id: string;
  supi: string;
  dnn: string;
  snssai: string;
  pduType: string;
  upf: string;
  teid: string;
  fiveQi: number;
  ul: string;
  dl: string;
  state: 'active' | 'establishing' | 'released';
}

/** PDU Session Manager — SMF / UPF session lifecycle via PFCP. */
@Component({
  selector: 'app-sessions',
  imports: [Icon, Sparkline, Drawer],
  templateUrl: './sessions.html',
  styleUrl: './sessions.css',
})
export class Sessions {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly selected = signal<PduSession | null>(null);

  protected readonly throughputTrend = [9, 11, 10, 13, 12, 14, 13, 15, 14, 16, 15, 14, 16, 14];

  protected readonly sessions = signal<PduSession[]>([
    {
      id: 'pdu-0x9a8',
      supi: 'imsi-208950000000001',
      dnn: 'internet',
      snssai: '01-000001',
      pduType: 'IPv4',
      upf: 'UPF-Node-01',
      teid: '0x0000 9a8f',
      fiveQi: 9,
      ul: '48 Mbps',
      dl: '210 Mbps',
      state: 'active',
    },
    {
      id: 'pdu-0x9b2',
      supi: 'imsi-208950000000002',
      dnn: 'ims',
      snssai: '02-000002',
      pduType: 'IPv4v6',
      upf: 'UPF-Node-01',
      teid: '0x0000 9b21',
      fiveQi: 5,
      ul: '12 Mbps',
      dl: '36 Mbps',
      state: 'active',
    },
    {
      id: 'pdu-0x9c7',
      supi: 'imsi-208950000000003',
      dnn: 'internet',
      snssai: '01-000001',
      pduType: 'IPv4',
      upf: 'UPF-Node-01',
      teid: '0x0000 9c7e',
      fiveQi: 9,
      ul: '—',
      dl: '—',
      state: 'establishing',
    },
  ]);

  protected open(s: PduSession): void {
    this.selected.set(s);
  }
  protected close(): void {
    this.selected.set(null);
  }

  protected async release(s: PduSession): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Release PDU session?',
      message: `Tear down ${s.id} for ${s.supi}. The SMF issues a PFCP Session Deletion to ${s.upf} and frees TEID ${s.teid}.`,
      confirmLabel: 'Release session',
      danger: true,
    });
    if (!ok) return;
    this.sessions.update((list) =>
      list.map((x) => (x.id === s.id ? { ...x, state: 'released', ul: '—', dl: '—' } : x)),
    );
    this.selected.update((sel) => (sel && sel.id === s.id ? { ...sel, state: 'released' } : sel));
    this.toast.success('Session released', `${s.id} torn down · TEID freed.`);
  }
}
