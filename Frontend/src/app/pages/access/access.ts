import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../ui/icon';
import { Drawer } from '../../ui/drawer';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

interface Operator {
  name: string;
  identity: string;
  role: string;
  lastActive: string;
  status: 'active' | 'disabled';
}
interface Role {
  role: string;
  scope: string;
  members: number;
}

/** Access Control — operator accounts, roles & permissions (RBAC). */
@Component({
  selector: 'app-access',
  imports: [Icon, Drawer, FormsModule],
  templateUrl: './access.html',
  styleUrl: './access.css',
})
export class Access {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly roleNames = ['SecOps Administrator', 'NetOps Engineer', 'Compliance Auditor', 'Read-Only'];
  protected readonly addOpen = signal(false);

  protected newName = '';
  protected newIdentity = '';
  protected newRole = this.roleNames[3];

  protected readonly operators = signal<Operator[]>([
    { name: 'Malek Aziz H.', identity: 'admin-secops@telecom.node', role: 'SecOps Administrator', lastActive: 'now', status: 'active' },
    { name: 'N. Trabelsi', identity: 'netops-eng@telecom.node', role: 'NetOps Engineer', lastActive: '12m', status: 'active' },
    { name: 'S. Ben Ali', identity: 'auditor@telecom.node', role: 'Compliance Auditor', lastActive: '3h', status: 'active' },
    { name: 'K. Mansour', identity: 'viewer@telecom.node', role: 'Read-Only', lastActive: '2d', status: 'disabled' },
  ]);

  protected readonly roles: Role[] = [
    { role: 'SecOps Administrator', scope: 'full: certs, policies, vault, mitigation', members: 1 },
    { role: 'NetOps Engineer', scope: 'sessions, conformance, observability, RAN', members: 1 },
    { role: 'Compliance Auditor', scope: 'audit, reports, read-only security', members: 1 },
    { role: 'Read-Only', scope: 'view all · no mutations', members: 1 },
  ];

  protected addOperator(): void {
    if (!this.newName.trim() || !this.newIdentity.trim()) {
      this.toast.danger('Missing fields', 'Name and identity are required.');
      return;
    }
    this.operators.update((list) => [
      { name: this.newName, identity: this.newIdentity, role: this.newRole, lastActive: 'never', status: 'active' },
      ...list,
    ]);
    this.addOpen.set(false);
    this.toast.success('Operator added', `${this.newName} · ${this.newRole}`);
    this.newName = '';
    this.newIdentity = '';
  }

  protected async toggle(o: Operator): Promise<void> {
    const disabling = o.status === 'active';
    const ok = await this.confirm.ask({
      title: disabling ? `Disable ${o.name}?` : `Enable ${o.name}?`,
      message: disabling
        ? `Revoke console access for ${o.identity}. Active sessions are terminated.`
        : `Restore console access for ${o.identity}.`,
      confirmLabel: disabling ? 'Disable' : 'Enable',
      danger: disabling,
    });
    if (!ok) return;
    const next: Operator['status'] = disabling ? 'disabled' : 'active';
    this.operators.update((list) =>
      list.map((x) => (x.identity === o.identity ? { ...x, status: next } : x)),
    );
    this.toast.success(disabling ? 'Operator disabled' : 'Operator enabled', o.identity);
  }
}
