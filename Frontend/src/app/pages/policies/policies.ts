import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../ui/icon';
import { Drawer } from '../../ui/drawer';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface Policy {
  name: string;
  source: string;
  dest: string;
  l7: string;
  ports: string;
  action: 'allow' | 'deny';
  hits: string;
}

interface DeniedFlow {
  time: string;
  source: string;
  dest: string;
  verdict: string;
}

/** Network Policies — Cilium / eBPF L7 zero-trust enforcement. */
@Component({
  selector: 'app-policies',
  imports: [Icon, Drawer, FormsModule],
  templateUrl: './policies.html',
  styleUrl: './policies.css',
})
export class Policies {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly addOpen = signal(false);
  protected readonly nfList = ['AMF', 'SMF', 'UPF', 'AUSF', 'UDM', 'NRF', 'PCF', 'NSSF', '*'];
  protected pName = '';
  protected pSource = 'AMF';
  protected pDest = 'SMF';
  protected pPorts = 'TCP/8443';
  protected pAction: 'allow' | 'deny' = 'allow';

  protected createPolicy(): void {
    if (!this.pName.trim()) {
      this.toast.danger('Name required', 'Give the policy a name.');
      return;
    }
    this.policies.update((list) => [
      {
        name: this.pName,
        source: this.pSource,
        dest: this.pDest,
        l7: 'HTTP/2 :path /*',
        ports: this.pPorts,
        action: this.pAction,
        hits: '0',
      },
      ...list,
    ]);
    this.addOpen.set(false);
    this.toast.success('Policy created', `${this.pName} → ${this.pAction.toUpperCase()}`);
    this.pName = '';
  }

  protected readonly policies = signal<Policy[]>([
    {
      name: 'allow-amf-to-smf',
      source: 'AMF',
      dest: 'SMF',
      l7: 'HTTP/2 :path /nsmf-pdusession/*',
      ports: 'TCP/8443',
      action: 'allow',
      hits: '1.2M',
    },
    {
      name: 'allow-amf-to-ausf',
      source: 'AMF',
      dest: 'AUSF',
      l7: 'HTTP/2 :path /nausf-auth/*',
      ports: 'TCP/8443',
      action: 'allow',
      hits: '418K',
    },
    {
      name: 'allow-smf-to-upf',
      source: 'SMF',
      dest: 'UPF',
      l7: 'PFCP',
      ports: 'UDP/8805',
      action: 'allow',
      hits: '96K',
    },
    {
      name: 'allow-nf-to-nrf',
      source: '*',
      dest: 'NRF',
      l7: 'HTTP/2 :path /nnrf-disc/*',
      ports: 'TCP/8443',
      action: 'allow',
      hits: '2.0M',
    },
    {
      name: 'deny-amf-to-upf',
      source: 'AMF',
      dest: 'UPF',
      l7: 'any',
      ports: 'any',
      action: 'deny',
      hits: '14',
    },
    {
      name: 'default-deny-all',
      source: '*',
      dest: '*',
      l7: 'any',
      ports: 'any',
      action: 'deny',
      hits: '231',
    },
  ]);

  protected async toggle(p: Policy): Promise<void> {
    const next = p.action === 'allow' ? 'deny' : 'allow';
    const ok = await this.confirm.ask({
      title: `Switch "${p.name}" to ${next.toUpperCase()}?`,
      message: `This recompiles the Cilium eBPF program and changes traffic ${p.source} → ${p.dest} to ${next.toUpperCase()} immediately.`,
      confirmLabel: `Set ${next}`,
      danger: next === 'deny',
    });
    if (!ok) return;
    this.policies.update((list) =>
      list.map((x) => (x.name === p.name ? { ...x, action: next } : x)),
    );
    this.toast.success('Policy updated', `${p.name} → ${next.toUpperCase()}`);
  }

  protected readonly denied: DeniedFlow[] = [
    {
      time: '14:02:09',
      source: 'AMF-Node-01',
      dest: 'UPF-Node-01:2152',
      verdict: 'DROPPED (policy deny-amf-to-upf)',
    },
    {
      time: '13:55:41',
      source: '10.10.9.4 (unknown)',
      dest: 'NRF-Node-01:8443',
      verdict: 'DROPPED (default-deny-all)',
    },
    {
      time: '13:40:12',
      source: 'SMF-Node-02',
      dest: 'UDM-Node-01:8443',
      verdict: 'DROPPED (mTLS handshake failed)',
    },
  ];
}
