import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../ui/icon';
import { Drawer } from '../../ui/drawer';
import { TableController, SortHeader, Pagination } from '../../ui/table';
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

const SLICES = ['01-000001 (eMBB)', '02-000002 (URLLC)', '03-000003 (mMTC)'];
const STATUSES: Subscriber['status'][] = ['registered', 'idle', 'deregistered'];

/** Deterministic mock directory — realistic volume so pagination is exercised. */
function seedSubscribers(count: number): Subscriber[] {
  const out: Subscriber[] = [];
  for (let i = 1; i <= count; i++) {
    const n = String(i).padStart(3, '0');
    // Cycle through states so the distribution looks like a live UDM:
    // most registered, some idle, a few deregistered.
    const status = STATUSES[i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0];
    out.push({
      supi: `imsi-208950000000${n}`,
      msisdn: `+216 20 000 ${n}`,
      status,
      slice: SLICES[i % SLICES.length],
      servingAmf: status === 'deregistered' ? '—' : `AMF-Node-0${(i % 2) + 1}`,
      authMethod: i % 4 === 0 ? 'EAP-AKA′' : '5G-AKA',
    });
  }
  return out;
}

/** Subscribers (UDM) — provisioning with MongoDB CSFLE on sensitive fields. */
@Component({
  selector: 'app-subscribers',
  imports: [Icon, Drawer, FormsModule, SortHeader, Pagination],
  templateUrl: './subscribers.html',
  styleUrl: './subscribers.css',
})
export class Subscribers {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly selected = signal<Subscriber | null>(null);
  protected readonly addOpen = signal(false);
  /** Simulated first fetch — drives the skeleton state. */
  protected readonly loading = signal(true);

  // New-subscriber form model + validation
  protected newImsi = '208950000000099';
  protected newMsisdn = '+216 20 000 099';
  protected newSlice = '01-000001 (eMBB)';
  protected newAuth = '5G-AKA';
  protected readonly imsiError = signal('');

  protected readonly subscribers = signal<Subscriber[]>(seedSubscribers(48));

  /** Sort / filter / paginate pipeline shared with every data table. */
  protected readonly table = new TableController(this.subscribers, ['supi', 'msisdn', 'slice']);

  constructor() {
    // Simulated UDM query latency so the skeleton state is visible.
    setTimeout(() => this.loading.set(false), 600);
  }

  protected readonly encryptedFields = [
    { field: 'permanentKey (K)', algo: 'AEAD_AES_256_CBC_HMAC_SHA_512', key: 'key-id-077c-b' },
    { field: 'opcKey (OPc)', algo: 'AEAD_AES_256_CBC_HMAC_SHA_512', key: 'key-id-1f4d-a' },
    { field: 'supi / imsi', algo: 'AEAD_AES_256_CBC_HMAC_SHA_512', key: 'key-id-091a-f' },
    { field: 'sequenceNumber (SQN)', algo: 'AEAD_AES_256_RANDOM', key: 'key-id-091a-f' },
  ];

  protected exportCsv(): void {
    downloadCsv(
      'subscribers',
      ['SUPI', 'MSISDN', 'Slice', 'Serving AMF', 'Auth Method', 'Status'],
      this.table
        .filtered()
        .map((s) => [s.supi, s.msisdn, s.slice, s.servingAmf, s.authMethod, s.status]),
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
    this.imsiError.set('');
    if (!/^\d{15}$/.test(this.newImsi)) {
      this.imsiError.set('IMSI must be exactly 15 digits (MCC+MNC+MSIN).');
      return;
    }
    const supi = `imsi-${this.newImsi}`;
    if (this.subscribers().some((s) => s.supi === supi)) {
      this.imsiError.set(`${supi} is already provisioned.`);
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
