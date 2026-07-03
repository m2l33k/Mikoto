import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';
import { AuthService } from './core/auth.service';
import { Shell } from './layout/shell';

export const routes: Routes = [
  // Standalone (no shell) views
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Secure Portal | Zero-Trust 5G Core',
  },
  {
    path: 'recover',
    loadComponent: () => import('./pages/recover/recover').then((m) => m.Recover),
    title: 'Key Restoration | Zero-Trust 5G Core',
  },
  {
    path: '500',
    loadComponent: () => import('./pages/server-error/server-error').then((m) => m.ServerError),
    title: '500 · Cluster Degradation',
  },

  // Authenticated console views inside the persistent shell
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    canActivateChild: [roleGuard],
    children: [
      // Land each operator on their role's home dashboard.
      { path: '', pathMatch: 'full', redirectTo: () => inject(AuthService).home() },

      {
        path: 'overview',
        loadComponent: () => import('./pages/overview/overview').then((m) => m.Overview),
        title: 'Platform Overview',
      },
      {
        path: 'viewer',
        loadComponent: () => import('./pages/viewer/viewer').then((m) => m.Viewer),
        title: 'Read-Only Console',
      },
      {
        path: 'topology',
        loadComponent: () => import('./pages/topology/topology').then((m) => m.Topology),
        title: 'Service Topology',
      },

      {
        path: 'registry',
        loadComponent: () => import('./pages/registry/registry').then((m) => m.Registry),
        title: 'NF Registry (NRF)',
      },
      {
        path: 'subscribers',
        loadComponent: () => import('./pages/subscribers/subscribers').then((m) => m.Subscribers),
        title: 'Subscribers (UDM)',
      },
      {
        path: 'sessions',
        loadComponent: () => import('./pages/sessions/sessions').then((m) => m.Sessions),
        title: 'PDU Sessions',
      },
      {
        path: 'slicing',
        loadComponent: () => import('./pages/slicing/slicing').then((m) => m.Slicing),
        title: 'Network Slicing (NSSF)',
      },
      {
        path: 'ran',
        loadComponent: () => import('./pages/ran/ran').then((m) => m.Ran),
        title: 'RAN / gNB',
      },

      {
        path: 'secops',
        loadComponent: () => import('./pages/secops/secops').then((m) => m.Secops),
        title: 'SecOps Console',
      },
      {
        path: 'pki',
        loadComponent: () => import('./pages/pki/pki').then((m) => m.Pki),
        title: 'PKI & Certificates',
      },
      {
        path: 'policies',
        loadComponent: () => import('./pages/policies/policies').then((m) => m.Policies),
        title: 'Network Policies',
      },
      {
        path: 'secrets',
        loadComponent: () => import('./pages/secrets/secrets').then((m) => m.Secrets),
        title: 'Secrets Vault',
      },
      {
        path: 'key-rotation',
        loadComponent: () => import('./pages/key-rotation/key-rotation').then((m) => m.KeyRotation),
        title: 'Credential Rotation Engine',
      },

      {
        path: 'netops',
        loadComponent: () => import('./pages/netops/netops').then((m) => m.Netops),
        title: 'NetOps Control Room',
      },
      {
        path: 'anomaly',
        loadComponent: () => import('./pages/anomaly/anomaly').then((m) => m.Anomaly),
        title: 'Anomaly Detection',
      },
      {
        path: 'alarms',
        loadComponent: () => import('./pages/alarms/alarms').then((m) => m.Alarms),
        title: 'Alarms Center',
      },
      {
        path: 'logs',
        loadComponent: () => import('./pages/logs/logs').then((m) => m.Logs),
        title: 'Logs Explorer',
      },
      {
        path: 'conformance',
        loadComponent: () => import('./pages/conformance/conformance').then((m) => m.Conformance),
        title: 'Conformance Tests',
      },
      {
        path: 'observability',
        loadComponent: () =>
          import('./pages/observability/observability').then((m) => m.Observability),
        title: 'Observability',
      },

      {
        path: 'audit',
        loadComponent: () => import('./pages/audit/audit').then((m) => m.Audit),
        title: 'Compliance Auditor Desk',
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports),
        title: 'Reports & Export',
      },

      {
        path: 'access',
        loadComponent: () => import('./pages/access/access').then((m) => m.Access),
        title: 'Access Control',
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
        title: 'Settings',
      },
    ],
  },

  // 404 — route unbound
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: '404 · Route Not Found',
  },
];
