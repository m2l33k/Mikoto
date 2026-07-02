import { computed, Injectable, signal } from '@angular/core';
import { RoleId, ROLES, toRole } from './roles';

const KEY = 'ztn.session';

export interface Session {
  identity: string;
  environment: string;
  mtls: boolean;
  since: number;
  role: RoleId;
}

/** Mock authentication backed by localStorage. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(this.restore());

  /** Active role (defaults to least privilege when unauthenticated). */
  readonly role = computed<RoleId>(() => this.session()?.role ?? 'read-only');
  /** Read-only operators must not see mutating controls. */
  readonly isReadOnly = computed(() => this.role() === 'read-only');
  /** Landing route for the active role. */
  readonly home = computed(() => ROLES[this.role()].home);

  get isAuthenticated(): boolean {
    return this.session() !== null;
  }

  login(identity: string, environment: string, mtls: boolean, role: RoleId): void {
    const s: Session = { identity, environment, mtls, since: Date.now(), role };
    localStorage.setItem(KEY, JSON.stringify(s));
    this.session.set(s);
  }

  logout(): void {
    localStorage.removeItem(KEY);
    this.session.set(null);
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      // Tolerate sessions persisted before roles existed.
      s.role = toRole(s.role);
      return s;
    } catch {
      return null;
    }
  }
}
