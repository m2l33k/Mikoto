import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../core/toast.service';

/** Interface 4 — 404 Route Unbound Screen (design.txt §2.4). */
@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected routingMap(): void {
    this.toast.info('Routing tree map', 'Opening NRF service routing topology…');
    this.router.navigate(['/topology']);
  }

  protected repoll(): void {
    this.toast.success('NRF re-polled', 'Service registry refreshed.');
    this.router.navigate(['/overview']);
  }
}
