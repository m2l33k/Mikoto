import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { ConfirmService } from '../core/confirm.service';

/** Renders global toasts + the confirm dialog. Mounted once at app root. */
@Component({
  selector: 'app-overlays',
  template: `
    <!-- Toasts -->
    <div class="toast-stack">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast toast--{{ t.kind }}" (click)="toast.dismiss(t.id)">
          <span class="toast__bar"></span>
          <div class="toast__body">
            <div class="toast__title">{{ t.title }}</div>
            @if (t.message) {
              <div class="toast__msg">{{ t.message }}</div>
            }
          </div>
          <button class="toast__x" type="button" aria-label="Dismiss">×</button>
        </div>
      }
    </div>

    <!-- Confirm dialog -->
    @if (confirm.current(); as c) {
      <div class="modal-overlay" (click)="confirm.answer(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3 class="modal__title">{{ c.title }}</h3>
          <p class="modal__msg">{{ c.message }}</p>
          <div class="modal__actions">
            <button class="ztn-btn ztn-btn--ghost" type="button" (click)="confirm.answer(false)">
              {{ c.cancelLabel ?? 'Cancel' }}
            </button>
            <button
              class="ztn-btn"
              [class.ztn-btn--danger]="c.danger"
              [class.ztn-btn--primary]="!c.danger"
              type="button"
              (click)="confirm.answer(true)"
            >
              {{ c.confirmLabel ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './overlays.css',
})
export class Overlays {
  protected readonly toast = inject(ToastService);
  protected readonly confirm = inject(ConfirmService);
}
