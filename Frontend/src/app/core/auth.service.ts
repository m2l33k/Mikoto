import { Injectable, signal } from '@angular/core';

const KEY = 'ztn.session';

export interface Session {
  identity: string;
  environment: string;
  mtls: boolean;
  since: number;
}

/** Mock authentication backed by localStorage. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(this.restore());

  get isAuthenticated(): boolean {
    return this.session() !== null;
  }

  login(identity: string, environment: string, mtls: boolean): void {
    const s: Session = { identity, environment, mtls, since: Date.now() };
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
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
