import { Component, inject, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Gauge } from '../../ui/charts';
import { ToastService } from '../../core/toast.service';

interface TestCase {
  id: string;
  name: string;
  procedure: string;
  criterion: string;
  latency: string;
  status: 'pass' | 'fail' | 'skip';
}
interface CiRun {
  id: string;
  commit: string;
  trigger: string;
  passed: number;
  failed: number;
  duration: string;
  status: 'success' | 'failed';
}
interface FaultScenario {
  name: string;
  inject: string;
  expected: string;
  result: 'pass' | 'fail';
}

/** Conformance Test Framework — TS 23.502 / TS 33.501 + fault injection. */
@Component({
  selector: 'app-conformance',
  imports: [Icon, Gauge],
  templateUrl: './conformance.html',
  styleUrl: './conformance.css',
})
export class Conformance {
  private readonly toast = inject(ToastService);
  protected readonly running = signal(false);

  protected runSuite(): void {
    if (this.running()) return;
    this.running.set(true);
    this.toast.info('Test suite started', 'Bringing up core + UERANSIM, executing scenarios…');
    setTimeout(() => {
      this.running.set(false);
      this.toast.success('Suite complete', '10 passed · 1 failed · 1 skipped (4m 12s)');
    }, 2600);
  }

  protected readonly tests: TestCase[] = [
    {
      id: 'TC-01',
      name: 'Initial UE Registration',
      procedure: 'TS 23.502 §4.2.2.2',
      criterion: 'Registration Accept ≤ 2s',
      latency: '210ms',
      status: 'pass',
    },
    {
      id: 'TC-02',
      name: '5G-AKA Authentication',
      procedure: 'TS 23.502 §4.6.2',
      criterion: 'RES* verified, SEAF key derived',
      latency: '145ms',
      status: 'pass',
    },
    {
      id: 'TC-03',
      name: 'PDU Session Establishment',
      procedure: 'TS 23.502 §4.3.2',
      criterion: 'GTP-U tunnel active',
      latency: '188ms',
      status: 'pass',
    },
    {
      id: 'TC-04',
      name: 'UE Deregistration',
      procedure: 'TS 23.502 §4.2.2.3',
      criterion: 'Sessions released, state cleared',
      latency: '96ms',
      status: 'pass',
    },
    {
      id: 'TC-05',
      name: 'Xn Handover',
      procedure: 'TS 23.502 §4.9.1.2',
      criterion: 'GTP-U path switched',
      latency: '—',
      status: 'skip',
    },
    {
      id: 'SEC-01',
      name: 'mTLS — no certificate',
      procedure: 'TS 33.501 §13',
      criterion: 'TLS handshake rejected',
      latency: '12ms',
      status: 'pass',
    },
    {
      id: 'SEC-02',
      name: 'Token scope violation',
      procedure: 'TS 33.501 §13.3',
      criterion: 'HTTP 403 on wrong scope',
      latency: '18ms',
      status: 'pass',
    },
    {
      id: 'SEC-03',
      name: 'IMSI enumeration',
      procedure: 'Threat model',
      criterion: 'Alert ≤ 10 probes',
      latency: '8 probes',
      status: 'pass',
    },
    {
      id: 'PERF-01',
      name: 'Registration throughput',
      procedure: 'KPI baseline',
      criterion: '≥ 50 concurrent',
      latency: '64 ok',
      status: 'pass',
    },
    {
      id: 'PERF-02',
      name: 'PDU session latency',
      procedure: 'KPI baseline',
      criterion: 'p95 ≤ 500ms',
      latency: '188ms',
      status: 'pass',
    },
    {
      id: 'TC-06',
      name: 'Service Request (idle→active)',
      procedure: 'TS 23.502 §4.2.3',
      criterion: 'UP reactivated',
      latency: '—',
      status: 'fail',
    },
  ];

  protected readonly runs: CiRun[] = [
    {
      id: '#248',
      commit: 'a3f91c2',
      trigger: 'push → main',
      passed: 10,
      failed: 1,
      duration: '4m 12s',
      status: 'failed',
    },
    {
      id: '#247',
      commit: '7be20d9',
      trigger: 'pull_request #61',
      passed: 10,
      failed: 0,
      duration: '4m 02s',
      status: 'success',
    },
    {
      id: '#246',
      commit: 'c10aa4e',
      trigger: 'push → main',
      passed: 10,
      failed: 0,
      duration: '3m 58s',
      status: 'success',
    },
  ];

  protected readonly faults: FaultScenario[] = [
    {
      name: 'SMF crash mid-session',
      inject: 'kill -9 smf-01',
      expected: 'NRF heartbeat timeout → session cleanup',
      result: 'pass',
    },
    {
      name: 'MongoDB unavailable',
      inject: 'partition udm↔mongo',
      expected: 'UDM returns 503, no hang',
      result: 'pass',
    },
    {
      name: 'Certificate expiry',
      inject: 'expire amf cert',
      expected: 'SBI calls rejected until rotation',
      result: 'pass',
    },
    {
      name: 'UPF network partition',
      inject: 'drop N4 to upf',
      expected: 'PFCP keepalive → teardown',
      result: 'pass',
    },
  ];
}
