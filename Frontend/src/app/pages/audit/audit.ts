import { Component } from '@angular/core';

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
  templateUrl: './audit.html',
  styleUrl: './audit.css',
})
export class Audit {
  protected readonly tokens: TokenAudit[] = [
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
  ];

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
