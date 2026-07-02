import { Component } from '@angular/core';

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
  templateUrl: './netops.html',
  styleUrl: './netops.css',
})
export class Netops {
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
