import { Component, inject } from '@angular/core';
import { Icon } from '../../ui/icon';
import { AreaChart, Gauge, Sparkline, Series } from '../../ui/charts';
import { timeLabels } from '../../ui/data';
import { AuthService } from '../../core/auth.service';

interface NfHealth {
  nf: string;
  role: string;
  status: 'healthy' | 'degraded' | 'down';
  cpu: number;
  trend: number[];
}
interface Event {
  time: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
}

/**
 * Read-Only Viewer console — the landing dashboard for the `read-only` role.
 * Presentation only: no mutating controls, no drawers, no forms.
 */
@Component({
  selector: 'app-viewer',
  imports: [Icon, AreaChart, Gauge, Sparkline],
  templateUrl: './viewer.html',
  styleUrl: './viewer.css',
})
export class Viewer {
  private readonly auth = inject(AuthService);
  protected readonly identity = this.auth.session()?.identity ?? 'viewer@telecom.node';

  protected readonly times = timeLabels(24, 5);

  protected readonly signalSeries: Series[] = [
    {
      name: 'req/s',
      color: 'var(--brand-accent)',
      data: [
        2300, 2410, 2280, 2500, 2360, 2440, 2390, 2520, 2450, 2400, 2470, 2560, 2480, 2510, 2360,
        2610, 2540, 2450, 2460, 2380, 2450, 2490, 2400, 2460,
      ],
    },
  ];

  protected readonly nfs: NfHealth[] = [
    {
      nf: 'AMF',
      role: 'Access & Mobility',
      status: 'healthy',
      cpu: 41,
      trend: [38, 40, 39, 42, 41, 43, 41],
    },
    {
      nf: 'SMF',
      role: 'Session Mgmt',
      status: 'healthy',
      cpu: 28,
      trend: [26, 27, 29, 28, 30, 28, 28],
    },
    {
      nf: 'UPF',
      role: 'User Plane',
      status: 'degraded',
      cpu: 76,
      trend: [60, 64, 69, 72, 74, 75, 76],
    },
    {
      nf: 'AUSF',
      role: 'Authentication',
      status: 'healthy',
      cpu: 18,
      trend: [16, 17, 18, 17, 19, 18, 18],
    },
    {
      nf: 'UDM',
      role: 'Unified Data',
      status: 'healthy',
      cpu: 22,
      trend: [20, 21, 23, 22, 22, 23, 22],
    },
    {
      nf: 'NRF',
      role: 'Registry',
      status: 'healthy',
      cpu: 12,
      trend: [11, 12, 12, 13, 12, 12, 12],
    },
  ];

  protected readonly events: Event[] = [
    {
      time: '14:02:11',
      severity: 'critical',
      source: 'ML-Engine',
      message: 'IMSI Catcher signature detected (192.168.12.9)',
    },
    {
      time: '13:58:40',
      severity: 'warning',
      source: 'UPF-Node-01',
      message: 'CPU saturation 76% sustained > 5m',
    },
    {
      time: '13:47:02',
      severity: 'warning',
      source: 'PKI',
      message: 'AMF certificate expires in 48h',
    },
    { time: '13:31:55', severity: 'info', source: 'NRF', message: 'NF registered: SMF-Node-02' },
  ];
}
