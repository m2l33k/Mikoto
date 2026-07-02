import { Component, computed, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Donut, Gauge, Slice } from '../../ui/charts';
import { TableController, SortHeader } from '../../ui/table';

interface TokenAudit {
  timestamp: string;
  consumer: string;
  provider: string;
  scope: string;
  status: 'valid' | 'revoked';
}

interface EncryptedField {
  scope: string;
  keyId: string;
  algorithm: string;
}

/** Persona C — Compliance / Auditor Dashboard (design.txt §3.3). */
@Component({
  selector: 'app-audit',
  imports: [Icon, Donut, Gauge, SortHeader],
  templateUrl: './audit.html',
  styleUrl: './audit.css',
})
export class Audit {
  private readonly tokenSource = signal<TokenAudit[]>([
    {
      timestamp: '14:02:11 UTC',
      consumer: 'AMF-Node-01',
      provider: 'UDM-Node-01',
      scope: 'nudm-sdm',
      status: 'valid',
    },
    {
      timestamp: '14:01:55 UTC',
      consumer: 'SMF-Node-02',
      provider: 'UDM-Node-01',
      scope: 'nudm-uecm',
      status: 'valid',
    },
    {
      timestamp: '14:01:30 UTC',
      consumer: 'AUSF-Node-01',
      provider: 'UDM-Node-01',
      scope: 'nudm-ueau',
      status: 'revoked',
    },
    {
      timestamp: '14:00:12 UTC',
      consumer: 'AMF-Node-01',
      provider: 'AUSF-Node-01',
      scope: 'nausf-auth',
      status: 'valid',
    },
    {
      timestamp: '13:59:48 UTC',
      consumer: 'SMF-Node-01',
      provider: 'PCF-Node-01',
      scope: 'npcf-smpolicy',
      status: 'valid',
    },
  ]);

  /** Sortable, filterable non-repudiation log. */
  protected readonly table = new TableController(this.tokenSource, [
    'consumer',
    'provider',
    'scope',
  ]);

  /** Token verification outcome split for the donut. */
  protected readonly verificationMix = computed<Slice[]>(() => {
    const t = this.tokenSource();
    const valid = t.filter((x) => x.status === 'valid').length;
    const revoked = t.length - valid;
    return [
      { name: 'Valid', value: valid, color: 'var(--brand-success)' },
      { name: 'Revoked', value: revoked, color: 'var(--brand-danger)' },
    ];
  });

  protected readonly fields: EncryptedField[] = [
    {
      scope: 'subscriber_db.profiles.imsi',
      keyId: 'key-id-091a-f',
      algorithm: 'AEAD_AES_256_CBC',
    },
    {
      scope: 'subscriber_db.profiles.k_key',
      keyId: 'key-id-077c-b',
      algorithm: 'AEAD_AES_256_CBC',
    },
    {
      scope: 'subscriber_db.profiles.opc_key',
      keyId: 'key-id-1f4d-a',
      algorithm: 'AEAD_AES_256_CBC',
    },
  ];
}
