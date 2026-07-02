import { Component, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Drawer } from '../../ui/drawer';
import { TableController, SortHeader } from '../../ui/table';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';
import { downloadCsv } from '../../core/csv';

interface NfInstance {
  type: string;
  instanceId: string;
  fqdn: string;
  endpoint: string;
  status: 'registered' | 'suspended' | 'deregistered';
  heartbeat: string;
  load: number;
  services: string;
  tls: boolean;
}

/** NF Registry (NRF) — service registration & discovery. */
@Component({
  selector: 'app-registry',
  imports: [Icon, Drawer, SortHeader],
  templateUrl: './registry.html',
  styleUrl: './registry.css',
})
export class Registry {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly selected = signal<NfInstance | null>(null);

  protected readonly instances = signal<NfInstance[]>([
    {
      type: 'AMF',
      instanceId: '3fa85f64-amf-01',
      fqdn: 'amf01.sbi.5gc.local',
      endpoint: '10.10.1.11:8443',
      status: 'registered',
      heartbeat: '2s ago',
      load: 41,
      services: 'namf-comm, namf-evts',
      tls: true,
    },
    {
      type: 'SMF',
      instanceId: '7bd92a10-smf-01',
      fqdn: 'smf01.sbi.5gc.local',
      endpoint: '10.10.1.21:8443',
      status: 'registered',
      heartbeat: '1s ago',
      load: 28,
      services: 'nsmf-pdusession',
      tls: true,
    },
    {
      type: 'SMF',
      instanceId: '7bd92a10-smf-02',
      fqdn: 'smf02.sbi.5gc.local',
      endpoint: '10.10.1.22:8443',
      status: 'registered',
      heartbeat: '3s ago',
      load: 19,
      services: 'nsmf-pdusession',
      tls: true,
    },
    {
      type: 'UPF',
      instanceId: 'c01d44e8-upf-01',
      fqdn: 'upf01.sbi.5gc.local',
      endpoint: '10.10.2.31:8443',
      status: 'registered',
      heartbeat: '2s ago',
      load: 76,
      services: 'pfcp (N4)',
      tls: true,
    },
    {
      type: 'AUSF',
      instanceId: '9ee21b73-ausf-1',
      fqdn: 'ausf01.sbi.5gc.local',
      endpoint: '10.10.1.41:8443',
      status: 'registered',
      heartbeat: '4s ago',
      load: 18,
      services: 'nausf-auth',
      tls: true,
    },
    {
      type: 'UDM',
      instanceId: '2ca70f55-udm-01',
      fqdn: 'udm01.sbi.5gc.local',
      endpoint: '10.10.1.51:8443',
      status: 'registered',
      heartbeat: '1s ago',
      load: 22,
      services: 'nudm-sdm, nudm-ueau',
      tls: true,
    },
    {
      type: 'PCF',
      instanceId: '5fd13c92-pcf-01',
      fqdn: 'pcf01.sbi.5gc.local',
      endpoint: '10.10.1.61:8443',
      status: 'registered',
      heartbeat: '5s ago',
      load: 9,
      services: 'npcf-smpolicy',
      tls: true,
    },
    {
      type: 'NSSF',
      instanceId: '88af0e21-nssf-1',
      fqdn: 'nssf01.sbi.5gc.local',
      endpoint: '10.10.1.71:8443',
      status: 'suspended',
      heartbeat: '38s ago',
      load: 0,
      services: 'nnssf-nsselection',
      tls: true,
    },
  ]);

  /** Sort + filter pipeline (8 fixed NFs — no pagination needed). */
  protected readonly table = new TableController(this.instances, ['type', 'fqdn', 'services']);

  protected exportCsv(): void {
    downloadCsv(
      'nf-registry',
      [
        'NF Type',
        'Instance ID',
        'FQDN',
        'Endpoint',
        'Services',
        'Load %',
        'Heartbeat',
        'TLS',
        'Status',
      ],
      this.instances().map((n) => [
        n.type,
        n.instanceId,
        n.fqdn,
        n.endpoint,
        n.services,
        n.load,
        n.heartbeat,
        n.tls ? 'mTLS' : 'none',
        n.status,
      ]),
    );
    this.toast.success('Export ready', 'nf-registry.csv downloaded.');
  }

  protected open(nf: NfInstance): void {
    this.selected.set(nf);
  }
  protected close(): void {
    this.selected.set(null);
  }

  protected async toggleStatus(nf: NfInstance): Promise<void> {
    const suspending = nf.status === 'registered';
    const ok = await this.confirm.ask({
      title: suspending ? `Suspend ${nf.type}?` : `Resume ${nf.type}?`,
      message: suspending
        ? `Suspending ${nf.fqdn} removes it from NRF discovery; consumers will fail over to peer instances.`
        : `Resuming ${nf.fqdn} re-advertises its services to the NRF for discovery.`,
      confirmLabel: suspending ? 'Suspend' : 'Resume',
      danger: suspending,
    });
    if (!ok) return;
    const next: NfInstance['status'] = suspending ? 'suspended' : 'registered';
    this.instances.update((list) =>
      list.map((x) =>
        x.instanceId === nf.instanceId ? { ...x, status: next, load: suspending ? 0 : 12 } : x,
      ),
    );
    this.selected.update((s) => (s && s.instanceId === nf.instanceId ? { ...s, status: next } : s));
    this.toast.success(suspending ? 'NF suspended' : 'NF resumed', `${nf.type} · ${nf.fqdn}`);
  }
}
