import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../ui/icon';
import { AuthService } from '../../core/auth.service';
import { PrefsService } from '../../core/prefs.service';

/** Interface 1 — Secure Portal Login (design.txt §2.1). */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly prefs = inject(PrefsService);
  private readonly router = inject(Router);

  protected readonly theme = this.prefs.theme;

  protected readonly environments = [
    '5G-LAB-PROD-SOUTH',
    '5G-LAB-DEV-NORTH',
    '5G-LAB-STAGING-EAST',
  ];

  protected env = this.prefs.environment();
  protected identity = 'admin-secops@telecom.node';
  protected passphrase = '';
  protected enforceMtls = signal(true);

  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected toggleTheme(): void {
    this.prefs.toggleTheme();
  }

  protected fillDemo(): void {
    this.identity = 'admin-secops@telecom.node';
    this.passphrase = 'demo-secops-2026';
    this.enforceMtls.set(true);
    this.error.set('');
  }

  protected initiate(event: Event): void {
    event.preventDefault();
    this.error.set('');

    if (!this.identity.trim()) {
      this.error.set('Administrative identity is required.');
      return;
    }
    if (this.passphrase.length < 6) {
      this.error.set('Signature passphrase must be at least 6 characters.');
      return;
    }

    this.busy.set(true);
    // Simulate secure-context establishment / mTLS handshake.
    setTimeout(() => {
      this.prefs.setEnvironment(this.env);
      this.auth.login(this.identity, this.env, this.enforceMtls());
      this.busy.set(false);
      this.router.navigate(['/overview']);
    }, 700);
  }
}
