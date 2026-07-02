import { Component, OnDestroy, output, signal } from '@angular/core';

export type TimeRange = '15m' | '1h' | '6h' | '24h';

/** Dashboard toolbar: time-range selector + auto-refresh interval. */
@Component({
  selector: 'ui-toolbar',
  template: `
    <div class="tb">
      <div class="tb__seg">
        @for (r of ranges; track r) {
          <button
            class="tb__b"
            [class.tb__b--on]="range() === r"
            type="button"
            (click)="setRange(r)"
          >
            {{ r }}
          </button>
        }
      </div>

      <select
        class="ztn-select tb__interval"
        [value]="interval()"
        (change)="setInterval($any($event.target).value)"
      >
        <option value="0">Auto-refresh: Off</option>
        <option value="10">Every 10s</option>
        <option value="30">Every 30s</option>
        <option value="60">Every 60s</option>
      </select>

      <button class="tb__refresh" type="button" (click)="manual()" title="Refresh now">
        <span class="tb__refresh-ico" [class.tb__refresh-ico--spin]="spinning()">⟳</span>
        Refresh
      </button>
    </div>
  `,
  styleUrl: './toolbar.css',
})
export class Toolbar implements OnDestroy {
  readonly ranges: TimeRange[] = ['15m', '1h', '6h', '24h'];
  readonly range = signal<TimeRange>('1h');
  readonly interval = signal('0');
  protected readonly spinning = signal(false);

  /** Emits the active range whenever data should be (re)loaded. */
  readonly refresh = output<TimeRange>();

  private timer: ReturnType<typeof setInterval> | null = null;

  setRange(r: TimeRange): void {
    this.range.set(r);
    this.emit();
  }

  setInterval(v: string): void {
    this.interval.set(v);
    this.restartTimer();
  }

  manual(): void {
    this.emit();
  }

  private emit(): void {
    this.spinning.set(true);
    this.refresh.emit(this.range());
    setTimeout(() => this.spinning.set(false), 500);
  }

  private restartTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const secs = Number(this.interval());
    if (secs > 0) {
      this.timer = setInterval(() => this.emit(), secs * 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
