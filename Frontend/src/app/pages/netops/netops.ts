import { Component } from '@angular/core';
import { Icon } from '../../ui/icon';
import { AreaChart, BarChart, Gauge, Series } from '../../ui/charts';
import { timeLabels } from '../../ui/data';

interface ConformanceTest {
  id: string;
  scenario: string;
  clause: string;
  latency: string;
  status: 'passed' | 'failed';
}

interface LogLine {
  time: string;
  tag: 'SMF' | 'UPF' | 'AMF' | 'ERR';
  message: string;
}

/** Persona B — NetOps Engineer Dashboard (design.txt §3.2). */
@Component({
  selector: 'app-netops',
  imports: [Icon, AreaChart, BarChart, Gauge],
  templateUrl: './netops.html',
  styleUrl: './netops.css',
})
export class Netops {
  protected readonly times = timeLabels(24, 5); // last 2h, 5-min steps

  /** Registration/setup signalling latency percentiles — the engineer's core KPI. */
  protected readonly latencySeries: Series[] = [
    {
      name: 'p50',
      color: 'var(--brand-success)',
      data: [
        42, 44, 41, 45, 43, 46, 44, 47, 45, 44, 46, 48, 45, 47, 44, 49, 46, 45, 44, 46, 45, 47, 44,
        46,
      ],
    },
    {
      name: 'p95',
      color: 'var(--brand-warning)',
      data: [
        98, 104, 96, 110, 102, 108, 100, 114, 106, 104, 108, 118, 110, 116, 104, 128, 118, 108, 106,
        104, 108, 112, 104, 110,
      ],
    },
    {
      name: 'p99',
      color: 'var(--brand-danger)',
      data: [
        180, 195, 176, 210, 188, 205, 192, 224, 206, 200, 208, 240, 218, 232, 200, 268, 238, 210,
        206, 200, 208, 220, 200, 216,
      ],
    },
  ];

  /** GTP-U user-plane throughput (Gbps) over the same window. */
  protected readonly throughputBars = [
    9, 11, 10, 13, 12, 14, 13, 15, 14, 16, 15, 14, 16, 14, 15, 17, 16, 14, 15, 13, 14, 15, 14, 14,
  ];

  protected readonly tests: ConformanceTest[] = [
    {
      id: 'TC-01',
      scenario: 'Initial Registration',
      clause: 'TS 23.502 §4.2.2.2',
      latency: '210ms',
      status: 'passed',
    },
    {
      id: 'TC-02',
      scenario: '5G-AKA Authentication',
      clause: 'TS 23.502 §4.6.2',
      latency: '145ms',
      status: 'passed',
    },
    {
      id: 'TC-03',
      scenario: 'PDU Session Setup',
      clause: 'TS 23.502 §4.3.2',
      latency: '188ms',
      status: 'passed',
    },
    {
      id: 'TC-04',
      scenario: 'Xn Handover',
      clause: 'TS 23.502 §4.9.1',
      latency: '—',
      status: 'failed',
    },
  ];

  protected readonly logs: LogLine[] = [
    {
      time: '14:02:11.201',
      tag: 'SMF',
      message: 'Sending PFCP Session Establishment Request to UPF',
    },
    {
      time: '14:02:11.215',
      tag: 'UPF',
      message: 'Received PFCP Request — GTP-U Tunnel 0x9a8 allocated',
    },
    {
      time: '14:02:11.231',
      tag: 'AMF',
      message: 'NAS Registration Accept dispatched to UE imsi-208950000000001',
    },
    {
      time: '14:02:11.244',
      tag: 'SMF',
      message: 'PFCP Session Context created on UPF Tunnel 0x9a8',
    },
    {
      time: '14:02:11.260',
      tag: 'UPF',
      message: 'GTP-U keep-alive echo response OK (peer 10.10.4.2)',
    },
  ];
}
