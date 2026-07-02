import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../ui/icon';
import { Drawer } from '../../ui/drawer';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface Cert {
  nf: string;
  cn: string;
  serial: string;
  algo: string;
  issued: string;
  expires: string;
  daysLeft: number;
}

/** PKI & Certificates — internal CA, X.509 NF identity, rotation. */
@Component({
  selector: 'app-pki',
  imports: [RouterLink, Icon, Drawer],
  templateUrl: './pki.html',
  styleUrl: './pki.css',
})
export class Pki {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly maxDays = 30;
  protected readonly selected = signal<Cert | null>(null);

  protected readonly certs = signal<Cert[]>([
    { nf: 'AMF', cn: 'amf01.sbi.5gc.local', serial: '0x4F:A2:1C', algo: 'RSA-4096', issued: '2026-06-23', expires: '2026-07-02', daysLeft: 2 },
    { nf: 'SMF', cn: 'smf01.sbi.5gc.local', serial: '0x4F:A2:1D', algo: 'RSA-4096', issued: '2026-06-25', expires: '2026-07-08', daysLeft: 8 },
    { nf: 'UPF', cn: 'upf01.sbi.5gc.local', serial: '0x4F:A2:1E', algo: 'ECDSA-P384', issued: '2026-06-26', expires: '2026-07-10', daysLeft: 10 },
    { nf: 'AUSF', cn: 'ausf01.sbi.5gc.local', serial: '0x4F:A2:1F', algo: 'RSA-4096', issued: '2026-06-27', expires: '2026-07-15', daysLeft: 15 },
    { nf: 'UDM', cn: 'udm01.sbi.5gc.local', serial: '0x4F:A2:20', algo: 'RSA-4096', issued: '2026-06-27', expires: '2026-07-18', daysLeft: 18 },
    { nf: 'NRF', cn: 'nrf01.sbi.5gc.local', serial: '0x4F:A2:21', algo: 'RSA-4096', issued: '2026-06-28', expires: '2026-07-22', daysLeft: 22 },
  ]);

  protected severity(days: number): 'danger' | 'warning' | 'success' {
    if (days <= 3) return 'danger';
    if (days <= 10) return 'warning';
    return 'success';
  }

  protected open(c: Cert): void {
    this.selected.set(c);
  }
  protected close(): void {
    this.selected.set(null);
  }

  protected async rotate(c: Cert): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Rotate ${c.nf} certificate?`,
      message: `Issue a fresh ${c.algo} leaf certificate for ${c.cn} from the 5GC-SBI-Issuer and hot-swap it on the running node.`,
      confirmLabel: 'Rotate certificate',
    });
    if (!ok) return;
    // Fresh 7-day leaf certificate.
    this.certs.update((list) =>
      list.map((x) => (x.serial === c.serial ? { ...x, daysLeft: 7 } : x)),
    );
    this.selected.update((s) => (s && s.serial === c.serial ? { ...s, daysLeft: 7 } : s));
    this.toast.success('Certificate rotated', `${c.nf} · ${c.cn} re-issued (7d TTL).`);
  }
}
