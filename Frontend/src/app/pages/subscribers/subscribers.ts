import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../ui/icon';
import { Drawer } from '../../ui/drawer';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';
import { downloadCsv } from '../../core/csv';

interface Subscriber {
  supi: string;
  msisdn: string;
  status: 'registered' | 'idle' | 'deregistered';
  slice: string;
  servingAmf: string;
  authMethod: string;
}

/** Subscribers (UDM) — provisioning with MongoDB CSFLE on sensitive fields. */
@Component({
  selector: 'app-subscribers',
  imports: [Icon, Drawer, FormsModule],
  templateUrl: './subscribers.html',
  styleUrl: './subscribers.css',
})
export class Subscribers {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly selected = signal<Subscriber | null>(null);
  protected readonly query = signal('');
  protected readonly addOpen = signal(false);

  // New-subscriber form model
  protected newImsi = '208950000000006';
  protected newMsisdn = '+216 20 000 006';
  protected newSlice = '01-000001 (eMBB)';
  protected newAuth = '5G-AKA';

  protected readonly subscribers = signal<Subscriber[]>([
    {
      supi: 'imsi-208950000000001',
      msisdn: '+216 20 000 001',
      status: 'registered',
      slice: '01-000001 (eMBB)',
      servingAmf: 'AMF-Node-01',
      authMethod: '5G-AKA',
    },
    {
      supi: 'imsi-208950000000002',
      msisdn: '+216 20 000 002',
      status: 'registered',
      slice: '01-000001 (eMBB)',
      servingAmf: 'AMF-Node-01',
      authMethod: '5G-AKA',
    },
    {
      supi: 'imsi-208950000000003',
      msisdn: '+216 20 000 003',
      status: 'idle',
      slice: '02-000002 (URLLC)',
      servingAmf: 'AMF-Node-01',
      authMethod: 'EAP-AKA′',
    },
    {
      supi: 'imsi-208950000000004',
      msisdn: '+216 20 000 004',
      status: 'idle',
      slice: '01-000001 (eMBB)',
      servingAmf: 'AMF-Node-01',
      authMethod: '5G-AKA',
    },
    {
      supi: 'imsi-208950000000005',
      msisdn: '+216 20 000 005',
      status: 'deregistered',
      slice: '03-000003 (mMTC)',
      servingAmf: '—',
      authMethod: '5G-AKA',
    },
  ]);

  protected readonly encryptedFields = [
    { field: 'permanentKey (K)', algo: 'AEAD_AES_256_CBC_HMAC_SHA_512', key: 'key-id-077c-b' },
    { field: 'opcKey (OPc)', algo: 'AEAD_AES_256_CBC_HMAC_SHA_512', key: 'key-id-1f4d-a' },
    { field: 'supi / imsi', algo: 'AEAD_AES_256_CBC_HMAC_SHA_512', key: 'key-id-091a-f' },
    { field: 'sequenceNumber (SQN)', algo: 'AEAD_AES_256_RANDOM', key: 'key-id-091a-f' },
  ];

  protected readonly filtered = () => {
    const q = this.query().toLowerCase().trim();
    const all = this.subscribers();
    if (!q) return all;
    return all.filter(
      (s) => s.supi.toLowerCase().includes(q) || s.msisdn.toLowerCase().includes(q),
    );
  };

  protected exportCsv(): void {
    downloadCsv(
      'subscribers',
      ['SUPI', 'MSISDN', 'Slice', 'Serving AMF', 'Auth Method', 'Status'],
      this.subscribers().map((s) => [
        s.supi,
        s.msisdn,
        s.slice,
        s.servingAmf,
        s.authMethod,
        s.status,
      ]),
    );
    this.toast.success('Export ready', 'subscribers.csv downloaded.');
  }

  protected open(s: Subscriber): void {
    this.selected.set(s);
  }
  protected close(): void {
    this.selected.set(null);
  }

  protected addSubscriber(): void {
    const supi = `imsi-${this.newImsi}`;
    if (this.subscribers().some((s) => s.supi === supi)) {
      this.toast.danger('Duplicate SUPI', `${supi} already provisioned.`);
      return;
    }
    this.subscribers.update((list) => [
      {
        supi,
        msisdn: this.newMsisdn,
        status: 'idle',
        slice: this.newSlice,
        servingAmf: 'AMF-Node-01',
        authMethod: this.newAuth,
      },
      ...list,
    ]);
    this.addOpen.set(false);
    this.toast.success('Subscriber provisioned', `${supi} · keys sealed via CSFLE.`);
  }

  protected async deregister(s: Subscriber): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Deregister subscriber?',
      message: `Release all sessions and clear AMF context for ${s.supi}.`,
      confirmLabel: 'Deregister',
      danger: true,
    });
    if (!ok) return;
    this.subscribers.update((list) =>
      list.map((x) => (x.supi === s.supi ? { ...x, status: 'deregistered', servingAmf: '—' } : x)),
    );
    this.selected.update((sel) =>
      sel && sel.supi === s.supi ? { ...sel, status: 'deregistered', servingAmf: '—' } : sel,
    );
    this.toast.warning('Subscriber deregistered', s.supi);
  }
}
