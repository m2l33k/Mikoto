import { Component, input } from '@angular/core';

/**
 * Huawei × Tunisie Telecom co-brand lockup.
 * Renders the official partner logos (public/brands/*.png, transparent).
 * In dark theme each logo sits on a white chip so the dark wordmarks
 * stay legible.
 *
 * variants: 'full'    → both logos + divider (header/login/footer)
 *           'compact' → smaller lockup (collapsed sidebar)
 */
@Component({
  selector: 'ui-brand',
  template: `
    <div class="brand" [class.brand--compact]="variant() === 'compact'">
      <span class="brand__chip">
        <img
          class="brand__logo"
          src="brands/huawei.png"
          alt="Huawei"
          [style.height.px]="markSize()"
        />
      </span>
      <span class="brand__divider" aria-hidden="true"></span>
      <span class="brand__chip">
        <img
          class="brand__logo"
          src="brands/tunisie-telecom.png"
          alt="Tunisie Telecom"
          [style.height.px]="markSize()"
        />
      </span>
    </div>
  `,
  styles: `
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
    }
    .brand--compact {
      gap: 5px;
    }
    .brand__chip {
      display: inline-flex;
      align-items: center;
      border-radius: 4px;
    }
    .brand__logo {
      display: block;
      width: auto;
    }
    /* Dark theme: white backing chip keeps the dark wordmarks legible. */
    :host-context([data-theme='dark']) .brand__chip {
      background: #ffffff;
      padding: 2px 5px;
    }
    .brand__divider {
      width: 1px;
      align-self: stretch;
      min-height: 18px;
      background: var(--border-strong);
    }
    .brand--compact .brand__divider {
      min-height: 12px;
    }
  `,
})
export class Brand {
  readonly variant = input<'full' | 'compact'>('full');
  /** Logo height in px (logos are roughly square, width flows from it). */
  readonly markSize = input(28);
}
