import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../core/toast.service';

/** Interface 2 — Cryptographic Access Reset / Forgot Password (design.txt §2.2). */
@Component({
  selector: 'app-recover',
  imports: [FormsModule, RouterLink],
  templateUrl: './recover.html',
  styleUrl: './recover.css',
})
export class Recover {
  protected identity = 'admin-secops@telecom.node';
  protected signature = `-----BEGIN PGP SIGNATURE-----
Hash: SHA512

iQIzBAEBCgAdFiEE... (paste verified cluster-anchor signature here)
=9aF2
-----END PGP SIGNATURE-----`;

  private readonly toast = inject(ToastService);

  constructor(private readonly router: Router) {}

  protected verify(event: Event): void {
    event.preventDefault();
    this.toast.success(
      'Signature verified',
      'Recovery token issued — sign in with new credentials.',
    );
    this.router.navigate(['/login']);
  }
}
