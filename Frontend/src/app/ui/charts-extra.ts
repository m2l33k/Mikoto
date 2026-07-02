import { Component, computed, input } from '@angular/core';

/* =====================================================================
   Additional CSS-based charts: heatmap, stacked bar, horizontal bar.
   Lightweight and fully responsive (no measuring required).
   ===================================================================== */

export interface HeatRow {
  label: string;
  values: number[];
}

/** Intensity heatmap (rows × columns). */
@Component({
  selector: 'ui-heatmap',
  template: `
    <div class="hm">
      <div class="hm__row hm__row--head" [style.gridTemplateColumns]="cols()">
        <span></span>
        @for (c of columns(); track $index) {
          <span class="hm__clabel">{{ c }}</span>
        }
      </div>
      @for (r of rows(); track r.label) {
        <div class="hm__row" [style.gridTemplateColumns]="cols()">
          <span class="hm__rlabel">{{ r.label }}</span>
          @for (v of r.values; track $index) {
            <span
              class="hm__cell"
              [style.background]="fill(v)"
              [title]="r.label + ' · ' + columns()[$index] + ': ' + v + unit()"
            ></span>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './charts-extra.css',
})
export class Heatmap {
  readonly rows = input<HeatRow[]>([]);
  readonly columns = input<string[]>([]);
  readonly color = input('var(--brand-primary)');
  readonly unit = input('');

  protected readonly cols = computed(
    () => `72px repeat(${this.columns().length}, 1fr)`,
  );
  private readonly max = computed(() =>
    Math.max(1, ...this.rows().flatMap((r) => r.values)),
  );

  protected fill(v: number): string {
    const pct = Math.round((v / this.max()) * 100);
    return `color-mix(in srgb, ${this.color()} ${pct}%, var(--bg-base))`;
  }
}

/* ------------------------------------------------------------------ */
export interface StackSeries {
  name: string;
  color: string;
  data: number[];
}

/** Stacked vertical bar chart. */
@Component({
  selector: 'ui-stacked-bar',
  template: `
    <div class="sb">
      <div class="sb__plot">
        @for (cat of categories(); track $index; let i = $index) {
          <div class="sb__col">
            <div class="sb__track" [title]="cat + ' · total ' + total(i) + unit()">
              @for (s of series(); track s.name) {
                <span
                  class="sb__seg"
                  [style.height.%]="(s.data[i] / maxTotal()) * 100"
                  [style.background]="s.color"
                ></span>
              }
            </div>
            <span class="sb__xlabel">{{ cat }}</span>
          </div>
        }
      </div>
      <div class="legend2">
        @for (s of series(); track s.name) {
          <span class="legend2__item"><i [style.background]="s.color"></i>{{ s.name }}</span>
        }
      </div>
    </div>
  `,
  styleUrl: './charts-extra.css',
})
export class StackedBar {
  readonly categories = input<string[]>([]);
  readonly series = input<StackSeries[]>([]);
  readonly unit = input('');

  protected total(i: number): number {
    return this.series().reduce((a, s) => a + (s.data[i] ?? 0), 0);
  }
  protected readonly maxTotal = computed(() => {
    const n = this.categories().length;
    let m = 1;
    for (let i = 0; i < n; i++) m = Math.max(m, this.total(i));
    return m;
  });
}

/* ------------------------------------------------------------------ */
export interface HBarItem {
  label: string;
  value: number;
  color?: string;
  unit?: string;
}

/** Horizontal bar list (top-N style). */
@Component({
  selector: 'ui-hbar',
  template: `
    <div class="hb">
      @for (it of items(); track it.label) {
        <div class="hb__row">
          <span class="hb__label">{{ it.label }}</span>
          <div class="hb__track">
            <span
              class="hb__fill"
              [style.width.%]="(it.value / max()) * 100"
              [style.background]="it.color ?? 'var(--brand-primary)'"
            ></span>
          </div>
          <span class="hb__val">{{ it.value }}{{ it.unit ?? '' }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './charts-extra.css',
})
export class HBar {
  readonly items = input<HBarItem[]>([]);
  protected readonly max = computed(() =>
    Math.max(1, ...this.items().map((i) => i.value)),
  );
}
