import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { Shell } from './layout/shell';
import { Login } from './pages/login/login';
import { Recover } from './pages/recover/recover';
import { ServerError } from './pages/server-error/server-error';
import { NotFound } from './pages/not-found/not-found';

import { Overview } from './pages/overview/overview';
import { Topology } from './pages/topology/topology';
import { Registry } from './pages/registry/registry';
import { Subscribers } from './pages/subscribers/subscribers';
import { Sessions } from './pages/sessions/sessions';
import { Secops } from './pages/secops/secops';
import { Pki } from './pages/pki/pki';
import { Policies } from './pages/policies/policies';
import { Secrets } from './pages/secrets/secrets';
import { KeyRotation } from './pages/key-rotation/key-rotation';
import { Netops } from './pages/netops/netops';
import { Anomaly } from './pages/anomaly/anomaly';
import { Conformance } from './pages/conformance/conformance';
import { Observability } from './pages/observability/observability';
import { Audit } from './pages/audit/audit';
import { Settings } from './pages/settings/settings';
import { Slicing } from './pages/slicing/slicing';
import { Ran } from './pages/ran/ran';
import { Alarms } from './pages/alarms/alarms';
import { Reports } from './pages/reports/reports';
import { Logs } from './pages/logs/logs';
import { Access } from './pages/access/access';

export const routes: Routes = [
  // Standalone (no shell) views
  { path: 'login', component: Login, title: 'Secure Portal | Zero-Trust 5G Core' },
  { path: 'recover', component: Recover, title: 'Key Restoration | Zero-Trust 5G Core' },
  { path: '500', component: ServerError, title: '500 · Cluster Degradation' },

  // Authenticated console views inside the persistent shell
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },

      { path: 'overview', component: Overview, title: 'Platform Overview' },
      { path: 'topology', component: Topology, title: 'Service Topology' },

      { path: 'registry', component: Registry, title: 'NF Registry (NRF)' },
      { path: 'subscribers', component: Subscribers, title: 'Subscribers (UDM)' },
      { path: 'sessions', component: Sessions, title: 'PDU Sessions' },
      { path: 'slicing', component: Slicing, title: 'Network Slicing (NSSF)' },
      { path: 'ran', component: Ran, title: 'RAN / gNB' },

      { path: 'secops', component: Secops, title: 'SecOps Console' },
      { path: 'pki', component: Pki, title: 'PKI & Certificates' },
      { path: 'policies', component: Policies, title: 'Network Policies' },
      { path: 'secrets', component: Secrets, title: 'Secrets Vault' },
      { path: 'key-rotation', component: KeyRotation, title: 'Credential Rotation Engine' },

      { path: 'netops', component: Netops, title: 'NetOps Control Room' },
      { path: 'anomaly', component: Anomaly, title: 'Anomaly Detection' },
      { path: 'alarms', component: Alarms, title: 'Alarms Center' },
      { path: 'logs', component: Logs, title: 'Logs Explorer' },
      { path: 'conformance', component: Conformance, title: 'Conformance Tests' },
      { path: 'observability', component: Observability, title: 'Observability' },

      { path: 'audit', component: Audit, title: 'Compliance Auditor Desk' },
      { path: 'reports', component: Reports, title: 'Reports & Export' },

      { path: 'access', component: Access, title: 'Access Control' },
      { path: 'settings', component: Settings, title: 'Settings' },
    ],
  },

  // 404 — route unbound
  { path: '**', component: NotFound, title: '404 · Route Not Found' },
];
