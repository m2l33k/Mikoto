import { Component } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Heatmap, HeatRow } from '../../ui/charts-extra';
import { timeLabels } from '../../ui/data';

interface Cell {
  cell: string;
  pci: number;
  tac: string;
  band: string;
  ues: number;
  prb: number;
  rsrp: number;
  status: 'up' | 'congested' | 'down';
}
interface Ue {
  supi: string;
  cell: string;
  rsrp: number;
  cqi: number;
  state: string;
}

/** RAN / gNB — radio access nodes, cells & connected UEs (UERANSIM). */
@Component({
  selector: 'app-ran',
  imports: [Icon, Heatmap],
  templateUrl: './ran.html',
  styleUrl: './ran.css',
})
export class Ran {
  protected readonly hours = timeLabels(8, 30);

  protected readonly prbHeat: HeatRow[] = [
    { label: 'Cell-01', values: [42, 51, 48, 63, 70, 88, 74, 61] },
    { label: 'Cell-02', values: [30, 35, 41, 52, 60, 72, 66, 54] },
    { label: 'Cell-03', values: [18, 22, 28, 31, 44, 58, 49, 38] },
    { label: 'Cell-04', values: [55, 62, 70, 81, 92, 96, 88, 79] },
    { label: 'Cell-05', values: [12, 15, 19, 24, 28, 33, 27, 21] },
  ];

  protected readonly cells: Cell[] = [
    {
      cell: 'Cell-01',
      pci: 101,
      tac: '0x1A2B',
      band: 'n78 (3.5GHz)',
      ues: 1,
      prb: 61,
      rsrp: -84,
      status: 'up',
    },
    {
      cell: 'Cell-02',
      pci: 102,
      tac: '0x1A2B',
      band: 'n78 (3.5GHz)',
      ues: 1,
      prb: 54,
      rsrp: -91,
      status: 'up',
    },
    {
      cell: 'Cell-03',
      pci: 103,
      tac: '0x1A2C',
      band: 'n258 (mmWave)',
      ues: 0,
      prb: 38,
      rsrp: -97,
      status: 'up',
    },
    {
      cell: 'Cell-04',
      pci: 104,
      tac: '0x1A2C',
      band: 'n78 (3.5GHz)',
      ues: 0,
      prb: 96,
      rsrp: -88,
      status: 'congested',
    },
    {
      cell: 'Cell-05',
      pci: 105,
      tac: '0x1A2D',
      band: 'n41 (2.5GHz)',
      ues: 0,
      prb: 21,
      rsrp: -102,
      status: 'down',
    },
  ];

  protected readonly ues: Ue[] = [
    { supi: 'imsi-208950000000001', cell: 'Cell-01', rsrp: -84, cqi: 14, state: 'RRC_CONNECTED' },
    { supi: 'imsi-208950000000002', cell: 'Cell-02', rsrp: -91, cqi: 11, state: 'RRC_CONNECTED' },
  ];
}
