import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

/** Interface 3 — Active Session & Credential Renewal (design.txt §2.3). */
@Component({
  selector: 'app-key-rotation',
  imports: [FormsModule],
  templateUrl: './key-rotation.html',
  styleUrl: './key-rotation.css',
})
export class KeyRotation {
  protected readonly scopes = [
    'Service-Based Interface (SBI)',
    'MongoDB Client Field Encryption (CSFLE)',
    'SCTP Transport Channels',
  ];
  protected readonly nodes = [
    'SBI-PROD-AMF-NODE-01',
    'SBI-PROD-SMF-NODE-01',
    'SBI-PROD-UPF-NODE-01',
  ];

  protected scope = this.scopes[0];
  protected node = this.nodes[0];
  protected keyspace = signal<'RSA-4096' | 'ECDSA-P384'>('RSA-4096');
  protected lifetimeHours = 168;

  // Telemetry — derived from a mock current certificate.
  protected readonly validForHours = signal(32);
  protected readonly expiredPct = signal(64);
  protected readonly busy = signal(false);

  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected async execute(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Execute key re-generation?',
      message: `Issue a new ${this.keyspace()} keypair for ${this.node} (${this.scope}) with a ${this.lifetimeHours}h lifetime. The previous certificate is retired after handover.`,
      confirmLabel: 'Re-generate keys',
    });
    if (!ok) return;
    this.busy.set(true);
    setTimeout(() => {
      this.validForHours.set(this.lifetimeHours);
      this.expiredPct.set(0);
      this.busy.set(false);
      this.toast.success(
        'Key rotation complete',
        `${this.keyspace()} cert issued for ${this.node} · valid ${this.lifetimeHours}h.`,
      );
    }, 900);
  }

  protected async retract(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Retract current certificates?',
      message: `This immediately revokes active certificates for ${this.node}. SBI calls from this node will be rejected until re-issued. Use only for compromise response.`,
      confirmLabel: 'Retract now',
      danger: true,
    });
    if (!ok) return;
    this.toast.warning('Certificates retracted', `${this.node} certificates revoked.`);
  }
}
