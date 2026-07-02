import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from './icon';
import { PrefsService } from '../core/prefs.service';
import { AuthService } from '../core/auth.service';

interface Command {
  label: string;
  hint: string;
  icon: string;
  run: () => void;
}

/** Global ⌘K / Ctrl-K command palette: jump to any page or run an action. */
@Component({
  selector: 'app-command-palette',
  imports: [Icon],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.css',
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly prefs = inject(PrefsService);
  private readonly auth = inject(AuthService);

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly active = signal(0);
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  private nav(label: string, path: string, icon: string): Command {
    return { label, hint: path, icon, run: () => this.router.navigate([path]) };
  }

  private readonly commands: Command[] = [
    this.nav('System Overview', '/overview', 'home'),
    this.nav('Service Topology', '/topology', 'topology'),
    this.nav('NF Registry (NRF)', '/registry', 'server'),
    this.nav('Subscribers (UDM)', '/subscribers', 'users'),
    this.nav('PDU Sessions', '/sessions', 'layers'),
    this.nav('Network Slicing', '/slicing', 'grid'),
    this.nav('RAN / gNB', '/ran', 'radio'),
    this.nav('SecOps Console', '/secops', 'shield'),
    this.nav('PKI & Certificates', '/pki', 'lock'),
    this.nav('Network Policies', '/policies', 'shield-check'),
    this.nav('Secrets Vault', '/secrets', 'database'),
    this.nav('Key Rotation', '/key-rotation', 'key'),
    this.nav('NetOps Core', '/netops', 'activity'),
    this.nav('Anomaly Detection', '/anomaly', 'alert'),
    this.nav('Alarms Center', '/alarms', 'bell'),
    this.nav('Logs Explorer', '/logs', 'search'),
    this.nav('Conformance Tests', '/conformance', 'check-square'),
    this.nav('Observability', '/observability', 'bar-chart'),
    this.nav('Audit Vault', '/audit', 'file-text'),
    this.nav('Reports & Export', '/reports', 'download'),
    this.nav('Access Control', '/access', 'user-check'),
    this.nav('Settings', '/settings', 'cpu'),
    { label: 'Toggle theme', hint: 'action', icon: 'globe', run: () => this.prefs.toggleTheme() },
    {
      label: 'Toggle sidebar',
      hint: 'action',
      icon: 'grid',
      run: () => this.prefs.toggleSidebar(),
    },
    {
      label: 'Sign out',
      hint: 'action',
      icon: 'lock',
      run: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      },
    },
  ];

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.commands;
    return this.commands.filter((c) => c.label.toLowerCase().includes(q));
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        setTimeout(() => this.inputRef()?.nativeElement.focus(), 0);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.toggle();
      return;
    }
    if (!this.open()) return;
    if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.active.update((i) => Math.min(i + 1, this.filtered().length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.active.update((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = this.filtered()[this.active()];
      if (c) this.run(c);
    }
  }

  toggle(): void {
    this.open.update((v) => !v);
    this.query.set('');
    this.active.set(0);
  }
  protected close(): void {
    this.open.set(false);
  }
  protected onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
    this.active.set(0);
  }
  protected run(c: Command): void {
    this.close();
    c.run();
  }
}
