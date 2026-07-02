import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

/* =====================================================================
   Production-grade, dependency-free SVG charts for the 5GC console.
   AreaChart / BarChart support responsive sizing (ResizeObserver),
   Y/X axes, gridlines, multi-series and hover tooltips.
   Sparkline / Gauge / Donut are lighter presentational helpers.
   ===================================================================== */

export interface Series {
  name: string;
  color: string;
  data: number[];
  dashed?: boolean;
}

const PAD_L = 46;
const PAD_R = 14;
const PAD_T = 12;
const PAD_B = 26;

function niceNumber(v: number): string {
  const a = Math.abs(v);
  if (a >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (a >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (a >= 100) return Math.round(v).toString();
  return (Math.round(v * 10) / 10).toString();
}

/* ------------------------------------------------------------------ */
/* Area / line chart with axes + tooltip                              */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'ui-area-chart',
  template: `
    <div class="chart" (mousemove)="onMove($event)" (mouseleave)="hover.set(-1)">
      <svg
        [attr.width]="width()"
        [attr.height]="height()"
        [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
        class="chart__svg"
      >
        <defs>
          @for (s of geo().series; track s.name) {
            <linearGradient [attr.id]="gid(s.name)" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="s.color" stop-opacity="0.28" />
              <stop offset="100%" [attr.stop-color]="s.color" stop-opacity="0" />
            </linearGradient>
          }
        </defs>

        <!-- horizontal grid + Y labels -->
        @for (t of geo().yTicks; track t.y) {
          <line
            [attr.x1]="padL"
            [attr.x2]="width() - padR"
            [attr.y1]="t.y"
            [attr.y2]="t.y"
            class="grid"
          />
          <text [attr.x]="padL - 8" [attr.y]="t.y + 3" class="axis axis--y">
            {{ t.label }}
          </text>
        }

        <!-- X labels -->
        @for (x of geo().xTicks; track x.x) {
          <text [attr.x]="x.x" [attr.y]="height() - 8" class="axis axis--x">
            {{ x.label }}
          </text>
        }

        <!-- series -->
        @for (s of geo().series; track s.name) {
          @if (area() && geo().series.length === 1) {
            <path [attr.d]="s.areaPath" [attr.fill]="'url(#' + gid(s.name) + ')'" />
          }
          <polyline
            [attr.points]="s.linePoints"
            fill="none"
            [attr.stroke]="s.color"
            stroke-width="1.75"
            stroke-linejoin="round"
            stroke-linecap="round"
            [attr.stroke-dasharray]="s.dashed ? '5 4' : null"
          />
        }

        <!-- hover crosshair + markers -->
        @if (hover() >= 0) {
          <line
            [attr.x1]="hoverX()"
            [attr.x2]="hoverX()"
            [attr.y1]="padT"
            [attr.y2]="height() - padB"
            class="crosshair"
          />
          @for (m of hoverMarkers(); track m.color) {
            <circle [attr.cx]="hoverX()" [attr.cy]="m.y" r="3" [attr.fill]="m.color" />
          }
        }
      </svg>

      @if (hover() >= 0) {
        <div class="chart__tip" [style.left.px]="hoverX()" [style.top.px]="padT">
          <div class="chart__tip-label">{{ tipLabel() }}</div>
          @for (m of hoverMarkers(); track m.name) {
            <div class="chart__tip-row">
              <span class="chart__tip-key"> <i [style.background]="m.color"></i>{{ m.name }} </span>
              <span class="chart__tip-val">{{ m.value }}{{ unit() }}</span>
            </div>
          }
        </div>
      }

      @if (series().length > 1) {
        <div class="legend">
          @for (s of series(); track s.name) {
            <span class="legend__item"> <i [style.background]="s.color"></i>{{ s.name }} </span>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './charts.css',
})
export class AreaChart {
  readonly series = input<Series[]>([]);
  readonly labels = input<string[]>([]);
  readonly height = input(220);
  readonly unit = input('');
  readonly area = input(true);

  protected readonly padL = PAD_L;
  protected readonly padR = PAD_R;
  protected readonly padT = PAD_T;
  protected readonly padB = PAD_B;

  protected readonly width = signal(640);
  protected readonly hover = signal(-1);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement.querySelector('.chart') as HTMLElement;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const w = entries[0].contentRect.width;
        if (w > 0) this.width.set(Math.round(w));
      });
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  protected gid(name: string): string {
    return 'grad-' + name.replace(/[^a-z0-9]/gi, '');
  }

  protected readonly geo = computed(() => {
    const w = this.width();
    const h = this.height();
    const iw = Math.max(10, w - PAD_L - PAD_R);
    const ih = Math.max(10, h - PAD_T - PAD_B);
    const all = this.series().flatMap((s) => s.data);
    let min = all.length ? Math.min(...all) : 0;
    let max = all.length ? Math.max(...all) : 1;
    const range = max - min || 1;
    max += range * 0.1;
    min = Math.max(0, min - range * 0.1);
    if (max === min) max = min + 1;

    const n = Math.max(1, (this.series()[0]?.data.length ?? 1) - 1);
    const xAt = (i: number) => PAD_L + (iw * i) / n;
    const yAt = (v: number) => PAD_T + ih - ((v - min) / (max - min)) * ih;

    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const val = min + ((max - min) * i) / 4;
      return { y: PAD_T + ih - (ih * i) / 4, label: niceNumber(val) };
    });

    const labels = this.labels();
    const count = this.series()[0]?.data.length ?? 0;
    const want = Math.min(6, count);
    const xTicks = Array.from({ length: want }, (_, k) => {
      const i = Math.round((k * (count - 1)) / Math.max(1, want - 1));
      return { x: xAt(i), label: labels[i] ?? '' };
    });

    const baseY = PAD_T + ih;
    const series = this.series().map((s) => {
      const pts = s.data.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`);
      const areaPath = pts.length
        ? `M ${xAt(0).toFixed(1)},${baseY} L ${pts.join(' L ')} L ${xAt(s.data.length - 1).toFixed(
            1,
          )},${baseY} Z`
        : '';
      return {
        name: s.name,
        color: s.color,
        dashed: s.dashed,
        linePoints: pts.join(' '),
        areaPath,
      };
    });

    return { iw, ih, min, max, xAt, yAt, yTicks, xTicks, series };
  });

  protected onMove(ev: MouseEvent): void {
    const svg = (ev.currentTarget as HTMLElement).querySelector('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const g = this.geo();
    const n = (this.series()[0]?.data.length ?? 1) - 1;
    if (n <= 0) return;
    let i = Math.round(((mx - PAD_L) / g.iw) * n);
    i = Math.max(0, Math.min(n, i));
    this.hover.set(i);
  }

  protected readonly hoverX = computed(() => this.geo().xAt(this.hover()));
  protected readonly tipLabel = computed(() => this.labels()[this.hover()] ?? `t-${this.hover()}`);
  protected readonly hoverMarkers = computed(() => {
    const i = this.hover();
    const g = this.geo();
    return this.series().map((s) => ({
      name: s.name,
      color: s.color,
      value: niceNumber(s.data[i] ?? 0),
      y: g.yAt(s.data[i] ?? 0),
    }));
  });
}

/* ------------------------------------------------------------------ */
/* Bar chart with axes + tooltip                                      */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'ui-bar-chart',
  template: `
    <div class="chart">
      <svg
        [attr.width]="width()"
        [attr.height]="height()"
        [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
        class="chart__svg"
      >
        @for (t of geo().yTicks; track t.y) {
          <line
            [attr.x1]="padL"
            [attr.x2]="width() - padR"
            [attr.y1]="t.y"
            [attr.y2]="t.y"
            class="grid"
          />
          <text [attr.x]="padL - 8" [attr.y]="t.y + 3" class="axis axis--y">
            {{ t.label }}
          </text>
        }
        @for (b of geo().bars; track b.x) {
          <rect
            [attr.x]="b.x"
            [attr.y]="b.y"
            [attr.width]="b.w"
            [attr.height]="b.h"
            rx="1.5"
            [attr.fill]="color()"
            [attr.fill-opacity]="hover() === b.i ? 1 : 0.8"
            (mouseenter)="hover.set(b.i)"
            (mouseleave)="hover.set(-1)"
          />
          @if (b.label) {
            <text [attr.x]="b.cx" [attr.y]="height() - 8" class="axis axis--x">
              {{ b.label }}
            </text>
          }
        }
      </svg>

      @if (hover() >= 0) {
        <div class="chart__tip" [style.left.px]="geo().bars[hover()].cx" [style.top.px]="padT">
          <div class="chart__tip-label">{{ labels()[hover()] ?? '' }}</div>
          <div class="chart__tip-row">
            <span class="chart__tip-key"><i [style.background]="color()"></i>{{ name() }}</span>
            <span class="chart__tip-val">{{ tipVal() }}{{ unit() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './charts.css',
})
export class BarChart {
  readonly values = input<number[]>([]);
  readonly labels = input<string[]>([]);
  readonly height = input(200);
  readonly color = input('var(--brand-accent)');
  readonly unit = input('');
  readonly name = input('value');

  protected readonly padL = PAD_L;
  protected readonly padR = PAD_R;
  protected readonly padT = PAD_T;
  protected readonly padB = PAD_B;

  protected readonly width = signal(640);
  protected readonly hover = signal(-1);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement.querySelector('.chart') as HTMLElement;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const w = entries[0].contentRect.width;
        if (w > 0) this.width.set(Math.round(w));
      });
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  protected readonly geo = computed(() => {
    const w = this.width();
    const h = this.height();
    const iw = Math.max(10, w - PAD_L - PAD_R);
    const ih = Math.max(10, h - PAD_T - PAD_B);
    const vals = this.values();
    const max = (vals.length ? Math.max(...vals) : 1) * 1.15 || 1;
    const labels = this.labels();
    const slot = iw / Math.max(1, vals.length);
    const bw = slot * 0.62;
    const baseY = PAD_T + ih;

    const yTicks = Array.from({ length: 5 }, (_, i) => ({
      y: PAD_T + ih - (ih * i) / 4,
      label: niceNumber((max * i) / 4),
    }));

    const everyLabel = Math.ceil(vals.length / 8);
    const bars = vals.map((v, i) => {
      const bh = (v / max) * ih;
      const x = PAD_L + slot * i + (slot - bw) / 2;
      return {
        i,
        x,
        cx: x + bw / 2,
        y: baseY - bh,
        w: bw,
        h: Math.max(1, bh),
        label: i % everyLabel === 0 ? (labels[i] ?? '') : '',
      };
    });

    return { yTicks, bars };
  });

  protected readonly tipVal = computed(() => niceNumber(this.values()[this.hover()] ?? 0));
}

/* ------------------------------------------------------------------ */
/* Donut with legend                                                  */
/* ------------------------------------------------------------------ */
export interface Slice {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'ui-donut',
  template: `
    <div class="donut">
      <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 42 42">
        <circle
          cx="21"
          cy="21"
          r="15.5"
          fill="none"
          stroke="var(--border-default)"
          stroke-width="5"
        />
        @for (a of arcs(); track a.name) {
          <circle
            cx="21"
            cy="21"
            r="15.5"
            fill="none"
            [attr.stroke]="a.color"
            stroke-width="5"
            [attr.stroke-dasharray]="a.dash"
            [attr.stroke-dashoffset]="a.offset"
            transform="rotate(-90 21 21)"
          />
        }
        <text x="21" y="19.5" text-anchor="middle" class="donut__total">{{ total() }}</text>
        <text x="21" y="25" text-anchor="middle" class="donut__cap">{{ centerLabel() }}</text>
      </svg>
      <div class="donut__legend">
        @for (s of data(); track s.name) {
          <div class="donut__row">
            <span class="donut__key"><i [style.background]="s.color"></i>{{ s.name }}</span>
            <span class="donut__val">{{ pct(s.value) }}%</span>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './charts.css',
})
export class Donut {
  readonly data = input<Slice[]>([]);
  readonly size = input(120);
  readonly centerLabel = input('total');

  private readonly circumference = 2 * Math.PI * 15.5;

  protected readonly total = computed(() =>
    niceNumber(this.data().reduce((a, s) => a + s.value, 0)),
  );

  protected pct(v: number): string {
    const sum = this.data().reduce((a, s) => a + s.value, 0) || 1;
    return ((v / sum) * 100).toFixed(1).replace(/\.0$/, '');
  }

  protected readonly arcs = computed(() => {
    const sum = this.data().reduce((a, s) => a + s.value, 0) || 1;
    let acc = 0;
    return this.data().map((s) => {
      const frac = s.value / sum;
      const len = frac * this.circumference;
      const arc = {
        name: s.name,
        color: s.color,
        dash: `${len.toFixed(2)} ${(this.circumference - len).toFixed(2)}`,
        offset: (-acc).toFixed(2),
      };
      acc += len;
      return arc;
    });
  });
}

/* ------------------------------------------------------------------ */
/* Inline sparkline (kept for KPI cards)                              */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'ui-sparkline',
  template: `
    <svg
      [attr.width]="width()"
      [attr.height]="height()"
      [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
      preserveAspectRatio="none"
      class="spark"
    >
      <polygon [attr.points]="area()" [attr.fill]="color()" fill-opacity="0.12" />
      <polyline
        [attr.points]="line()"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: [':host{display:block}.spark{display:block;width:100%}'],
})
export class Sparkline {
  readonly points = input<number[]>([]);
  readonly width = input(160);
  readonly height = input(40);
  readonly color = input('var(--brand-accent)');

  private readonly coords = computed(() => {
    const p = this.points();
    if (p.length < 2) return [] as Array<[number, number]>;
    const w = this.width();
    const h = this.height();
    const min = Math.min(...p);
    const max = Math.max(...p);
    const span = max - min || 1;
    const step = w / (p.length - 1);
    const pad = 3;
    return p.map(
      (v, i) => [i * step, h - pad - ((v - min) / span) * (h - pad * 2)] as [number, number],
    );
  });

  protected readonly line = computed(() =>
    this.coords()
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' '),
  );

  protected readonly area = computed(() => {
    const c = this.coords();
    if (!c.length) return '';
    const h = this.height();
    return `${c[0][0]},${h} ${this.line()} ${c[c.length - 1][0]},${h}`;
  });
}

/* ------------------------------------------------------------------ */
/* Radial gauge (kept)                                                */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'ui-gauge',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 42 42" class="gauge">
      <circle
        cx="21"
        cy="21"
        r="15.5"
        fill="none"
        stroke="var(--border-default)"
        stroke-width="4"
      />
      <circle
        cx="21"
        cy="21"
        r="15.5"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="4"
        stroke-linecap="round"
        [attr.stroke-dasharray]="dash()"
        transform="rotate(-90 21 21)"
      />
      <text x="21" y="22" text-anchor="middle" dominant-baseline="middle" class="g-val">
        {{ percent() }}%
      </text>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .g-val {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 600;
        fill: var(--text-primary);
      }
    `,
  ],
})
export class Gauge {
  readonly percent = input(0);
  readonly size = input(96);
  readonly color = input('var(--brand-success)');

  private readonly circumference = 2 * Math.PI * 15.5;
  protected readonly dash = computed(() => {
    const filled = (this.percent() / 100) * this.circumference;
    return `${filled.toFixed(2)} ${this.circumference.toFixed(2)}`;
  });
}
