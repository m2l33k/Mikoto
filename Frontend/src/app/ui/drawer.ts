import { Component, HostListener, input, output } from '@angular/core';

/** Reusable right-side slide-over panel. Content is projected. */
@Component({
  selector: 'app-drawer',
  template: `
    @if (open()) {
      <div class="drawer-overlay" (click)="closed.emit()">
        <aside
          class="drawer"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title() || 'Detail panel'"
          (click)="$event.stopPropagation()"
        >
          <header class="drawer__head">
            <div>
              <div class="drawer__eyebrow">{{ eyebrow() }}</div>
              <h3 class="drawer__title">{{ title() }}</h3>
            </div>
            <button class="drawer__x" type="button" (click)="closed.emit()" aria-label="Close">
              ×
            </button>
          </header>
          <div class="drawer__body">
            <ng-content />
          </div>
          <footer class="drawer__foot">
            <ng-content select="[drawer-actions]" />
          </footer>
        </aside>
      </div>
    }
  `,
  styleUrl: './drawer.css',
})
export class Drawer {
  readonly open = input(false);
  readonly title = input('');
  readonly eyebrow = input('');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
