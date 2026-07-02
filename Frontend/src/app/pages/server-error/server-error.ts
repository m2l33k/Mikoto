import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

/** Interface 5 — 500 Infrastructure Exception Screen (design.txt §2.5). */
@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.html',
  styleUrl: './server-error.css',
})
export class ServerError {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);
  protected readonly rebooting = signal(false);

  protected downloadPcap(): void {
    this.toast.success('PCAP exported', 'sbi-prod-amf-node-01.pcap downloaded.');
  }

  protected async reboot(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Force pod reboot?',
      message:
        'Force-restart SBI-PROD-AMF-NODE-01. In-flight signalling on this pod will be dropped and re-attempted by peers.',
      confirmLabel: 'Reboot pod',
      danger: true,
    });
    if (!ok) return;
    this.rebooting.set(true);
    this.toast.warning('Pod restarting', 'SBI-PROD-AMF-NODE-01 — draining…');
    setTimeout(() => {
      this.rebooting.set(false);
      this.toast.success('Pod recovered', 'AMF-Node-01 healthy · mTLS re-established.');
      this.router.navigate(['/overview']);
    }, 2200);
  }

  protected readonly panicLog = [
    'panic: runtime error: invalid memory address or nil pointer dereference',
    '[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x83e2]',
    'goroutine 198 [running]:',
    'github.com/malekaziz/5gc/amf/nas/handler.HandleRegistration(...)',
    '        /build/amf/nas/handler/registration.go:142 +0x1a4',
  ];
}
