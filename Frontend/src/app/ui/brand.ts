import { Component, input } from '@angular/core';

/**
 * Huawei × Tunisie Telecom co-brand lockup.
 * Original SVG marks drawn in each partner's visual language (Huawei
 * corporate red petal mark, Tunisie Telecom blue orbital mark) — no
 * trademarked artwork is embedded.
 *
 * variants: 'full'    → both marks + wordmarks + divider (header/login)
 *           'compact' → marks only (collapsed sidebar)
 *           'mono'    → single-line footer treatment
 */
@Component({
  selector: 'ui-brand',
  template: `
    <div class="brand" [class.brand--compact]="variant() === 'compact'">
      <!-- Huawei-style petal mark -->
      <span class="brand__unit" aria-label="Huawei">
        <svg
          class="brand__mark"
          [attr.width]="markSize()"
          [attr.height]="markSize()"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <g fill="var(--brand-primary)">
            <path d="M11 3c-2.5 2.8-3.6 6.4-3.2 9.8.1.6.8.8 1.2.4L11 11V3Z" />
            <path d="M13 3c2.5 2.8 3.6 6.4 3.2 9.8-.1.6-.8.8-1.2.4L13 11V3Z" />
            <path d="M5.6 6.2c-.9 3 .1 6.3 2.3 8.6.4.4 1.1.1 1.1-.5V10L5.6 6.2Z" />
            <path d="M18.4 6.2c.9 3-.1 6.3-2.3 8.6-.4.4-1.1.1-1.1-.5V10l3.4-3.8Z" />
            <path d="M3.5 11.5c.6 2.4 2.5 4.5 4.9 5.4.5.2 1-.3.8-.8l-1.3-3-4.4-1.6Z" />
            <path d="M20.5 11.5c-.6 2.4-2.5 4.5-4.9 5.4-.5.2-1-.3-.8-.8l1.3-3 4.4-1.6Z" />
            <path d="M8.2 18.6c2.4 1 5.2 1 7.6 0 .3-.1.3-.5 0-.6H8.2c-.3.1-.3.5 0 .6Z" />
          </g>
        </svg>
        @if (variant() !== 'compact') {
          <span class="brand__word brand__word--huawei">HUAWEI</span>
        }
      </span>

      <span class="brand__divider" aria-hidden="true"></span>

      <!-- Tunisie Telecom-style orbital mark -->
      <span class="brand__unit" aria-label="Tunisie Telecom">
        <svg
          class="brand__mark"
          [attr.width]="markSize()"
          [attr.height]="markSize()"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5.2" fill="var(--brand-accent)" />
          <path
            d="M2.8 14.5C5.5 18.6 10.6 21 15.6 20 19 19.3 21.4 17 22 14.2"
            stroke="var(--brand-accent)"
            stroke-width="2.1"
            stroke-linecap="round"
            fill="none"
            opacity="0.55"
          />
        </svg>
        @if (variant() !== 'compact') {
          <span class="brand__word brand__word--tt">Tunisie&nbsp;Telecom</span>
        }
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
    .brand__unit {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .brand__mark {
      flex: none;
    }
    .brand__word {
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1;
    }
    .brand__word--huawei {
      font-size: 13px;
      color: var(--brand-primary);
      letter-spacing: 0.1em;
    }
    .brand__word--tt {
      font-size: 12px;
      color: var(--brand-accent);
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
  readonly variant = input<'full' | 'compact' | 'mono'>('full');
  readonly markSize = input(20);
}
