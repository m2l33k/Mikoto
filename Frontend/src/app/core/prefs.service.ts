import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

/** Persisted UI preferences (theme, target environment, sidebar). */
@Injectable({ providedIn: 'root' })
export class PrefsService {
  readonly theme = signal<Theme>(this.read('ztn.theme', 'light') as Theme);
  readonly environment = signal<string>(this.read('ztn.env', '5G-LAB-PROD-SOUTH'));
  readonly sidebarCollapsed = signal<boolean>(this.read('ztn.sidebar', 'false') === 'true');

  constructor() {
    this.applyTheme(this.theme());
  }

  setTheme(t: Theme): void {
    this.theme.set(t);
    localStorage.setItem('ztn.theme', t);
    this.applyTheme(t);
  }
  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setEnvironment(env: string): void {
    this.environment.set(env);
    localStorage.setItem('ztn.env', env);
  }

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    localStorage.setItem('ztn.sidebar', String(next));
  }

  private applyTheme(t: Theme): void {
    document.documentElement.setAttribute('data-theme', t);
  }
  private read(key: string, fallback: string): string {
    return localStorage.getItem(key) ?? fallback;
  }
}
