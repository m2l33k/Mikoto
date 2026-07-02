import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../ui/icon';
import { AuthService } from '../../core/auth.service';
import { PrefsService } from '../../core/prefs.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

/** Settings & profile — preferences, security, session. */
@Component({
  selector: 'app-settings',
  imports: [FormsModule, Icon],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly prefs = inject(PrefsService);

  protected readonly environments = [
    '5G-LAB-PROD-SOUTH',
    '5G-LAB-DEV-NORTH',
    '5G-LAB-STAGING-EAST',
  ];

  protected readonly identity = this.auth.session()?.identity ?? 'admin-secops@telecom.node';
  protected displayName = 'Malek Aziz H.';
  protected role = 'SecOps Administrator';

  protected readonly notifyCritical = signal(true);
  protected readonly notifyWarning = signal(true);
  protected readonly notifyInfo = signal(false);
  protected readonly autoRotate = signal(true);
  protected readonly enforceMtls = signal(true);

  protected readonly sessionSince = new Date(
    this.auth.session()?.since ?? Date.now(),
  ).toLocaleString('en-GB');

  protected setTheme(t: 'dark' | 'light'): void {
    this.prefs.setTheme(t);
  }

  protected setEnv(env: string): void {
    this.prefs.setEnvironment(env);
  }

  protected saveProfile(): void {
    this.toast.success('Profile saved', `${this.displayName} · ${this.role}`);
  }

  protected savePreferences(): void {
    this.toast.success('Preferences updated', 'Notification & security settings stored.');
  }

  protected async revokeSessions(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Revoke all active sessions?',
      message:
        'This terminates every authenticated console session for this identity, including this one. You will be returned to the login portal.',
      confirmLabel: 'Revoke all',
      danger: true,
    });
    if (!ok) return;
    this.toast.warning('All sessions revoked', 'Re-authentication required.');
    setTimeout(() => this.auth.logout(), 600);
  }
}
