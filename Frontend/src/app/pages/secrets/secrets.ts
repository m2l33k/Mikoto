import { Component, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface Engine {
  path: string;
  type: string;
  description: string;
  secrets: number;
}
interface Lease {
  time: string;
  consumer: string;
  path: string;
  ttl: string;
  action: 'lease' | 'renew' | 'revoke';
}

/** Secrets Vault — HashiCorp Vault dynamic secrets & audit. */
@Component({
  selector: 'app-secrets',
  imports: [Icon],
  templateUrl: './secrets.html',
  styleUrl: './secrets.css',
})
export class Secrets {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly sealed = signal(false);

  protected readonly engines: Engine[] = [
    { path: 'pki/', type: 'PKI', description: '5GC-SBI-Issuer — leaf cert issuance', secrets: 12 },
    {
      path: 'transit/',
      type: 'Transit',
      description: 'CSFLE customer master key wrapping',
      secrets: 4,
    },
    {
      path: 'database/',
      type: 'Database',
      description: 'MongoDB dynamic credentials (UDM)',
      secrets: 6,
    },
    {
      path: 'kv/5gc/',
      type: 'KV v2',
      description: 'NF static config & JWT signing keys',
      secrets: 26,
    },
  ];

  protected readonly leases = signal<Lease[]>([
    {
      time: '14:02:11',
      consumer: 'UDM-Node-01',
      path: 'database/creds/udm-ro',
      ttl: '1h',
      action: 'lease',
    },
    {
      time: '13:58:02',
      consumer: 'AMF-Node-01',
      path: 'pki/issue/sbi',
      ttl: '168h',
      action: 'lease',
    },
    {
      time: '13:40:55',
      consumer: 'SMF-Node-01',
      path: 'transit/decrypt/csfle',
      ttl: '—',
      action: 'renew',
    },
    {
      time: '13:12:30',
      consumer: 'AUSF-Node-01',
      path: 'kv/5gc/jwt-signing',
      ttl: '—',
      action: 'lease',
    },
    {
      time: '12:55:09',
      consumer: 'NSSF-Node-01',
      path: 'pki/issue/sbi',
      ttl: '0',
      action: 'revoke',
    },
  ]);

  protected async toggleSeal(): Promise<void> {
    const sealing = !this.sealed();
    const ok = await this.confirm.ask({
      title: sealing ? 'Seal Vault?' : 'Unseal Vault?',
      message: sealing
        ? 'Sealing Vault halts all secret issuance and dynamic credential leasing across the core. Active NFs keep cached secrets until TTL.'
        : 'Unsealing restores secret engines and dynamic credential issuance.',
      confirmLabel: sealing ? 'Seal now' : 'Unseal',
      danger: sealing,
    });
    if (!ok) return;
    this.sealed.set(sealing);
    if (sealing) this.toast.danger('Vault sealed', 'Secret issuance suspended.');
    else this.toast.success('Vault unsealed', 'Secret engines online.');
  }

  protected async revoke(l: Lease): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Revoke lease?',
      message: `Immediately revoke ${l.consumer}'s lease on ${l.path}.`,
      confirmLabel: 'Revoke lease',
      danger: true,
    });
    if (!ok) return;
    this.leases.update((list) =>
      list.map((x) => (x === l ? { ...x, action: 'revoke', ttl: '0' } : x)),
    );
    this.toast.warning('Lease revoked', `${l.consumer} · ${l.path}`);
  }
}
