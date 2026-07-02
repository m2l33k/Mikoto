import { Component, computed, inject, OnDestroy, signal, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Icon } from '../ui/icon';
import { Brand } from '../ui/brand';
import { CommandPalette } from '../ui/command-palette';
import { AuthService } from '../core/auth.service';
import { PrefsService } from '../core/prefs.service';
import { ToastService } from '../core/toast.service';
import { RoleId, ROLES, roleCanSee } from '../core/roles';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  /** When set, the item is shown only for this exact role. */
  only?: RoleId;
}
interface NavGroup {
  title: string;
  items: NavItem[];
}
interface Notice {
  kind: 'danger' | 'warning' | 'info';
  title: string;
  time: string;
}

/** Persistent three-tier layout with interactive header (design.txt §1.3). */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Brand, CommandPalette],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly prefs = inject(PrefsService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly environments = [
    '5G-LAB-PROD-SOUTH',
    '5G-LAB-DEV-NORTH',
    '5G-LAB-STAGING-EAST',
  ];

  protected readonly theme = this.prefs.theme;
  protected readonly targetEnv = this.prefs.environment;
  protected readonly collapsed = this.prefs.sidebarCollapsed;
  protected readonly user = computed(() => this.auth.session()?.identity ?? 'operator');
  protected readonly initials = computed(() => {
    const id = this.user();
    return id.replace(/@.*/, '').slice(0, 2).toUpperCase();
  });
  /** Active role metadata — drives the role label + nav filtering. */
  protected readonly roleMeta = computed(() => ROLES[this.auth.role()]);
  protected readonly isReadOnly = this.auth.isReadOnly;

  protected readonly clock = signal(this.now());

  /** Off-canvas sidebar state — mobile viewports only (≤900px). */
  protected readonly mobileOpen = signal(false);
  protected readonly notifyOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly notices: Notice[] = [
    { kind: 'danger', title: 'IMSI Catcher signature detected (192.168.12.9)', time: '2m' },
    { kind: 'warning', title: 'AMF certificate expires in 48h', time: '14m' },
    { kind: 'warning', title: 'UPF-Node-01 CPU saturation 76%', time: '23m' },
    { kind: 'info', title: 'NF registered: SMF-Node-02', time: '31m' },
  ];
  protected readonly unread = this.notices.length;

  private readonly allGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Read-Only Console', path: '/viewer', icon: 'shield', only: 'read-only' },
        { label: 'System Overview', path: '/overview', icon: 'home' },
        { label: 'Service Topology', path: '/topology', icon: 'topology' },
      ],
    },
    {
      title: 'Core Network',
      items: [
        { label: 'NF Registry (NRF)', path: '/registry', icon: 'server' },
        { label: 'Subscribers (UDM)', path: '/subscribers', icon: 'users' },
        { label: 'PDU Sessions', path: '/sessions', icon: 'layers' },
        { label: 'Network Slicing', path: '/slicing', icon: 'grid' },
        { label: 'RAN / gNB', path: '/ran', icon: 'radio' },
      ],
    },
    {
      title: 'Zero-Trust Security',
      items: [
        { label: 'SecOps Console', path: '/secops', icon: 'shield' },
        { label: 'PKI & Certificates', path: '/pki', icon: 'lock' },
        { label: 'Network Policies', path: '/policies', icon: 'shield-check' },
        { label: 'Secrets Vault', path: '/secrets', icon: 'database' },
        { label: 'Key Rotation', path: '/key-rotation', icon: 'key' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'NetOps Core', path: '/netops', icon: 'activity' },
        { label: 'Anomaly Detection', path: '/anomaly', icon: 'alert' },
        { label: 'Alarms Center', path: '/alarms', icon: 'bell' },
        { label: 'Logs Explorer', path: '/logs', icon: 'search' },
        { label: 'Conformance Tests', path: '/conformance', icon: 'check-square' },
        { label: 'Observability', path: '/observability', icon: 'bar-chart' },
      ],
    },
    {
      title: 'Compliance',
      items: [
        { label: 'Audit Vault', path: '/audit', icon: 'file-text' },
        { label: 'Reports & Export', path: '/reports', icon: 'download' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Access Control', path: '/access', icon: 'user-check' },
        { label: 'Settings', path: '/settings', icon: 'cpu' },
      ],
    },
  ];

  /** Nav filtered to the pages the active role may reach (empty groups dropped). */
  protected readonly groups = computed<NavGroup[]>(() => {
    const role = this.auth.role();
    return this.allGroups
      .map((g) => ({
        title: g.title,
        items: g.items.filter((i) => (!i.only || i.only === role) && roleCanSee(role, i.path)),
      }))
      .filter((g) => g.items.length > 0);
  });

  /** Current URL, tracked for the breadcrumb trail. */
  private readonly currentUrl = signal(this.router.url);

  /** Breadcrumb trail derived from the full nav model: group → page. */
  protected readonly crumbs = computed(() => {
    const url = this.currentUrl().split('?')[0];
    for (const group of this.allGroups) {
      const item = group.items.find((i) => url.startsWith(i.path));
      if (item) return [group.title, item.label];
    }
    return [];
  });

  private readonly timer = setInterval(() => this.clock.set(this.now()), 1000);

  constructor() {
    // Track navigation for breadcrumbs; close transient panels on route change.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects);
        this.mobileOpen.set(false);
        this.closeMenus();
      });
  }

  private now(): string {
    return new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' UTC';
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenus();
    this.mobileOpen.set(false);
  }

  protected toggleTheme(): void {
    this.prefs.toggleTheme();
  }

  /** Hamburger: off-canvas drawer on mobile, collapse on desktop. */
  protected toggleNav(): void {
    if (window.matchMedia('(max-width: 900px)').matches) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.prefs.toggleSidebar();
    }
  }
  protected toggleSidebar(): void {
    this.prefs.toggleSidebar();
  }
  protected onEnvChange(value: string): void {
    this.prefs.setEnvironment(value);
    this.toast.info('Environment switched', value);
  }
  protected toggleNotify(): void {
    this.notifyOpen.update((v) => !v);
    this.userMenuOpen.set(false);
  }
  protected toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
    this.notifyOpen.set(false);
  }
  protected closeMenus(): void {
    this.notifyOpen.set(false);
    this.userMenuOpen.set(false);
  }
  protected logout(): void {
    this.auth.logout();
    this.toast.success('Session terminated', 'Secure context closed.');
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
