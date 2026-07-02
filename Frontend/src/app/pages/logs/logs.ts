import { Component, computed, OnDestroy, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { ToastService } from '../../core/toast.service';

type Sev = 'info' | 'warn' | 'error' | 'debug';
interface LogLine {
  ts: string;
  nf: string;
  sev: Sev;
  msg: string;
}

const NFS = ['AMF', 'SMF', 'UPF', 'AUSF', 'UDM', 'NRF', 'PCF', 'NSSF'];
const SAMPLES: Array<[string, Sev, string]> = [
  ['SMF', 'info', 'PFCP Session Establishment Request → UPF-Node-01 (seid 0x9a8)'],
  ['UPF', 'info', 'GTP-U TEID 0x9a8f allocated, gate OPEN'],
  ['AMF', 'info', 'NAS Registration Accept → imsi-208950000000001'],
  ['AUSF', 'info', '5G-AKA: RES* verified, SEAF key derived'],
  ['NRF', 'debug', 'Nnrf-disc query target-nf-type=SMF (1 hit)'],
  ['UDM', 'info', 'Nudm-sdm subscription data served (CSFLE sealed)'],
  ['UPF', 'warn', 'PFCP heartbeat latency 210ms to peer 10.10.2.31'],
  ['AMF', 'warn', 'NAS retransmission for UE imsi-208950000000003'],
  ['NSSF', 'error', 'NF heartbeat timeout (38s) — marking suspended'],
  ['PCF', 'info', 'Npcf-smpolicy decision: 5QI 9 gate OPEN'],
  ['NRF', 'error', 'mTLS handshake failed from 10.10.9.4 (unknown peer)'],
  ['SMF', 'debug', 'PDR/FAR/QER installed on UPF tunnel 0x9a8'],
];

/** Logs Explorer — centralized NF log search with live tail. */
@Component({
  selector: 'app-logs',
  imports: [Icon],
  templateUrl: './logs.html',
  styleUrl: './logs.css',
})
export class Logs implements OnDestroy {
  private readonly toast = inject(ToastService);

  protected readonly nfs = NFS;
  protected readonly nfFilter = signal('ALL');
  protected readonly sevFilter = signal('ALL');
  protected readonly query = signal('');
  protected readonly live = signal(true);

  protected readonly lines = signal<LogLine[]>(this.seed());

  protected readonly filtered = computed(() => {
    const nf = this.nfFilter();
    const sev = this.sevFilter();
    const q = this.query().toLowerCase().trim();
    return this.lines().filter(
      (l) =>
        (nf === 'ALL' || l.nf === nf) &&
        (sev === 'ALL' || l.sev === sev) &&
        (!q || l.msg.toLowerCase().includes(q)),
    );
  });

  protected readonly errorCount = computed(
    () => this.lines().filter((l) => l.sev === 'error').length,
  );
  protected readonly warnCount = computed(
    () => this.lines().filter((l) => l.sev === 'warn').length,
  );

  private timer = setInterval(() => {
    if (this.live()) this.lines.update((l) => [this.rand(), ...l].slice(0, 200));
  }, 1600);

  private seed(): LogLine[] {
    return Array.from({ length: 18 }, () => this.rand());
  }
  private rand(): LogLine {
    const [nf, sev, msg] = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    const d = new Date();
    const ts = d.toLocaleTimeString('en-GB', { hour12: false }) +
      '.' + d.getMilliseconds().toString().padStart(3, '0');
    return { ts, nf, sev, msg };
  }

  protected toggleLive(): void {
    this.live.update((v) => !v);
  }
  protected clear(): void {
    this.lines.set([]);
    this.toast.info('Log buffer cleared');
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
