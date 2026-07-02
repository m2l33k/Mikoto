import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../ui/icon';
import { Brand } from '../../ui/brand';
import { AuthService } from '../../core/auth.service';
import { PrefsService } from '../../core/prefs.service';
import { RoleId, ROLE_LIST, ROLES } from '../../core/roles';

/** Interface 1 — Secure Portal Login (design.txt §2.1). */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Icon, Brand],
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

  protected readonly roles = ROLE_LIST;
  protected env = this.prefs.environment();
  protected role: RoleId = 'secops-admin';
  protected identity = 'admin-secops@telecom.node';
  protected passphrase = '';
  protected enforceMtls = signal(true);

  protected readonly busy = signal(false);
  protected readonly error = signal('');
  /** Per-field inline validation errors. */
  protected readonly identityError = signal('');
  protected readonly passphraseError = signal('');

  protected toggleTheme(): void {
    this.prefs.toggleTheme();
  }

  /** Suggest a matching demo identity when the operator picks a role. */
  protected onRoleChange(): void {
    const demo: Record<RoleId, string> = {
      'secops-admin': 'admin-secops@telecom.node',
      'netops-engineer': 'netops-eng@telecom.node',
      'compliance-auditor': 'auditor@telecom.node',
      'read-only': 'viewer@telecom.node',
    };
    this.identity = demo[this.role];
    this.clearErrors();
  }

  protected fillDemo(): void {
    this.onRoleChange();
    this.passphrase = 'demo-secops-2026';
    this.enforceMtls.set(true);
    this.clearErrors();
  }

  private clearErrors(): void {
    this.error.set('');
    this.identityError.set('');
    this.passphraseError.set('');
  }

  private validate(): boolean {
    this.clearErrors();
    let ok = true;
    const id = this.identity.trim();
    if (!id) {
      this.identityError.set('Administrative identity is required.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+$/.test(id)) {
      this.identityError.set('Identity must be a valid domain address (name@domain).');
      ok = false;
    }
    if (!this.passphrase) {
      this.passphraseError.set('Signature passphrase is required.');
      ok = false;
    } else if (this.passphrase.length < 6) {
      this.passphraseError.set('Passphrase must be at least 6 characters.');
      ok = false;
    }
    return ok;
  }

  protected initiate(event: Event): void {
    event.preventDefault();
    if (!this.validate()) return;

    this.busy.set(true);
    // Simulate secure-context establishment / mTLS handshake.
    setTimeout(() => {
      this.prefs.setEnvironment(this.env);
      this.auth.login(this.identity, this.env, this.enforceMtls(), this.role);
      this.busy.set(false);
      // Land each operator on their role's home dashboard.
      this.router.navigate([ROLES[this.role].home]);
    }, 700);
  }
}
