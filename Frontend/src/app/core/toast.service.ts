import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'warning' | 'danger' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message: string;
}

/** Global, signal-based toast/notification feed. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  private push(kind: ToastKind, title: string, message: string): void {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, kind, title, message }]);
    setTimeout(() => this.dismiss(id), 4500);
  }

  success(title: string, message = ''): void {
    this.push('success', title, message);
  }
  warning(title: string, message = ''): void {
    this.push('warning', title, message);
  }
  danger(title: string, message = ''): void {
    this.push('danger', title, message);
  }
  info(title: string, message = ''): void {
    this.push('info', title, message);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
