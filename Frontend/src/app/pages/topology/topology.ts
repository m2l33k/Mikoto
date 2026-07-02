import { Component, computed, signal } from '@angular/core';
import { Icon } from '../../ui/icon';
import { Drawer } from '../../ui/drawer';

type Plane = 'control' | 'user' | 'access';
type EdgeKind = 'sbi' | 'radio' | 'data';

interface Node {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  plane: Plane;
}
interface Edge {
  a: string;
  b: string;
  ref: string;
  kind: EdgeKind;
}
interface ResolvedEdge extends Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mx: number;
  my: number;
}

const NODE_W = 92;
const NODE_H = 46;

/** Service Topology — SBA mesh map with mTLS-secured interfaces. */
@Component({
  selector: 'app-topology',
  imports: [Icon, Drawer],
  templateUrl: './topology.html',
  styleUrl: './topology.css',
})
export class Topology {
  protected readonly selected = signal<Node | null>(null);

  protected select(n: Node): void {
    this.selected.set(n);
  }
  protected close(): void {
    this.selected.set(null);
  }
  protected readonly nodeEdges = computed(() => {
    const n = this.selected();
    if (!n) return [];
    return this.resolved.filter((e) => e.a === n.id || e.b === n.id);
  });
  protected peer(e: ResolvedEdge): string {
    const id = this.selected()?.id;
    return e.a === id ? e.b : e.a;
  }
  protected readonly nodes: Node[] = [
    { id: 'UE', label: 'UE', sub: '2 registered', x: 24, y: 300, plane: 'access' },
    { id: 'GNB', label: 'gNB', sub: 'UERANSIM', x: 168, y: 300, plane: 'access' },
    { id: 'UPF', label: 'UPF', sub: 'GTP-U', x: 360, y: 300, plane: 'user' },
    { id: 'DN', label: 'DN', sub: 'Internet', x: 700, y: 300, plane: 'user' },
    { id: 'AMF', label: 'AMF', sub: 'Access & Mob.', x: 360, y: 70, plane: 'control' },
    { id: 'SMF', label: 'SMF', sub: 'Session', x: 360, y: 185, plane: 'control' },
    { id: 'NRF', label: 'NRF', sub: 'Registry', x: 520, y: 130, plane: 'control' },
    { id: 'AUSF', label: 'AUSF', sub: 'Auth', x: 680, y: 40, plane: 'control' },
    { id: 'UDM', label: 'UDM', sub: 'Subscribers', x: 680, y: 150, plane: 'control' },
    { id: 'PCF', label: 'PCF', sub: 'Policy', x: 520, y: 230, plane: 'control' },
    { id: 'NSSF', label: 'NSSF', sub: 'Slicing', x: 168, y: 70, plane: 'control' },
  ];

  private readonly edges: Edge[] = [
    { a: 'UE', b: 'GNB', ref: 'Uu (radio)', kind: 'radio' },
    { a: 'GNB', b: 'AMF', ref: 'N2 / NGAP', kind: 'sbi' },
    { a: 'GNB', b: 'UPF', ref: 'N3 / GTP-U', kind: 'data' },
    { a: 'UPF', b: 'DN', ref: 'N6', kind: 'data' },
    { a: 'AMF', b: 'SMF', ref: 'N11 / Nsmf', kind: 'sbi' },
    { a: 'SMF', b: 'UPF', ref: 'N4 / PFCP', kind: 'sbi' },
    { a: 'AMF', b: 'AUSF', ref: 'N12 / Nausf', kind: 'sbi' },
    { a: 'AUSF', b: 'UDM', ref: 'N13 / Nudm', kind: 'sbi' },
    { a: 'AMF', b: 'UDM', ref: 'N8 / Nudm', kind: 'sbi' },
    { a: 'SMF', b: 'UDM', ref: 'N10 / Nudm', kind: 'sbi' },
    { a: 'SMF', b: 'PCF', ref: 'N7 / Npcf', kind: 'sbi' },
    { a: 'AMF', b: 'NSSF', ref: 'N22 / Nnssf', kind: 'sbi' },
    { a: 'AMF', b: 'NRF', ref: 'Nnrf', kind: 'sbi' },
    { a: 'SMF', b: 'NRF', ref: 'Nnrf', kind: 'sbi' },
  ];

  protected readonly nodeW = NODE_W;
  protected readonly nodeH = NODE_H;

  protected readonly resolved: ResolvedEdge[] = this.edges.map((e) => {
    const a = this.nodes.find((n) => n.id === e.a)!;
    const b = this.nodes.find((n) => n.id === e.b)!;
    const x1 = a.x + NODE_W / 2;
    const y1 = a.y + NODE_H / 2;
    const x2 = b.x + NODE_W / 2;
    const y2 = b.y + NODE_H / 2;
    return { ...e, x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
  });

  protected readonly sbiEdges = this.resolved.filter((e) => e.kind === 'sbi');
}
