import { Component, computed, input, output, signal, Signal } from '@angular/core';

/* =====================================================================
   Reusable data-table machinery: sorting + text filtering + pagination.
   Pages own their data; TableController owns the view pipeline so every
   table behaves identically (aria-sort, page clamping, empty states).
   ===================================================================== */

export type SortDir = 'asc' | 'desc';

/**
 * Signal-based view pipeline for data tables.
 * rows → filter(query) → sort(key, dir) → paginate(page, size).
 */
export class TableController<T> {
  readonly query = signal('');
  readonly sortKey = signal<keyof T | null>(null);
  readonly sortDir = signal<SortDir>('asc');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  /** All rows surviving the filter, in sorted order (pre-pagination). */
  readonly filtered: Signal<T[]>;
  /** Rows for the current page — bind the table body to this. */
  readonly view: Signal<T[]>;
  readonly total: Signal<number>;
  readonly pageCount: Signal<number>;

  constructor(
    private readonly rows: Signal<T[]>,
    /** Which fields the search box matches against. */
    private readonly searchFields: (keyof T)[] = [],
  ) {
    this.filtered = computed(() => {
      const q = this.query().trim().toLowerCase();
      let out = this.rows();
      if (q && this.searchFields.length) {
        out = out.filter((r) =>
          this.searchFields.some((f) => String(r[f]).toLowerCase().includes(q)),
        );
      }
      const key = this.sortKey();
      if (key !== null) {
        const dir = this.sortDir() === 'asc' ? 1 : -1;
        out = [...out].sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
          return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
        });
      }
      return out;
    });

    this.total = computed(() => this.filtered().length);
    this.pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

    this.view = computed(() => {
      const page = Math.min(this.page(), this.pageCount());
      const size = this.pageSize();
      return this.filtered().slice((page - 1) * size, page * size);
    });
  }

  search(q: string): void {
    this.query.set(q);
    this.page.set(1);
  }

  /** Toggle sort on a column: none → asc → desc → asc… */
  sortBy(key: keyof T): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.page.set(1);
  }

  /** aria-sort value for a column header. */
  ariaSort(key: keyof T): 'ascending' | 'descending' | null {
    if (this.sortKey() !== key) return null;
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  setPage(p: number): void {
    this.page.set(Math.min(Math.max(1, p), this.pageCount()));
  }
  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }
}

/** Sortable column header. Use inside <thead><tr> in place of a plain th. */
@Component({
  selector: 'th[ui-sort]',
  host: { class: 'th-sort', '[attr.aria-sort]': 'dir() ?? undefined' },
  template: `
    <button class="th-sort__btn" type="button" (click)="toggled.emit()">
      <ng-content />
      <span class="th-sort__arrow" aria-hidden="true">
        {{ dir() === 'ascending' ? '▲' : dir() === 'descending' ? '▼' : '△' }}
      </span>
    </button>
  `,
})
export class SortHeader {
  /** Current aria-sort state, from TableController.ariaSort(key). */
  readonly dir = input<'ascending' | 'descending' | null>(null);
  readonly toggled = output<void>();
}

/** Pagination footer: range info, page buttons with ellipses, size select. */
@Component({
  selector: 'ui-pagination',
  template: `
    <nav class="ztn-pager" aria-label="Table pagination">
      <span class="ztn-pager__info">
        {{ rangeStart() }}–{{ rangeEnd() }} of {{ total() }} · page {{ page() }}/{{ pageCount() }}
      </span>
      <div class="ztn-pager__nav">
        <button
          class="ztn-pager__btn"
          type="button"
          [disabled]="page() <= 1"
          (click)="go(page() - 1)"
          aria-label="Previous page"
        >
          ‹
        </button>
        @for (p of pageItems(); track $index) {
          @if (p === -1) {
            <span class="ztn-pager__gap" aria-hidden="true">…</span>
          } @else {
            <button
              class="ztn-pager__btn"
              [class.ztn-pager__btn--current]="p === page()"
              type="button"
              [attr.aria-current]="p === page() ? 'page' : null"
              (click)="go(p)"
            >
              {{ p }}
            </button>
          }
        }
        <button
          class="ztn-pager__btn"
          type="button"
          [disabled]="page() >= pageCount()"
          (click)="go(page() + 1)"
          aria-label="Next page"
        >
          ›
        </button>
        <select
          class="ztn-select ztn-pager__size"
          [value]="pageSize()"
          (change)="sizeChange.emit(+$any($event.target).value)"
          aria-label="Rows per page"
        >
          @for (s of sizes(); track s) {
            <option [value]="s">{{ s }}/page</option>
          }
        </select>
      </div>
    </nav>
  `,
})
export class Pagination {
  readonly page = input(1);
  readonly pageCount = input(1);
  readonly total = input(0);
  readonly pageSize = input(10);
  readonly sizes = input<number[]>([10, 25, 50]);

  readonly pageChange = output<number>();
  readonly sizeChange = output<number>();

  protected readonly rangeStart = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );
  protected readonly rangeEnd = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );

  /** Page buttons with ellipsis gaps (-1 sentinel), e.g. 1 … 4 5 6 … 12. */
  protected readonly pageItems = computed<number[]>(() => {
    const count = this.pageCount();
    const cur = this.page();
    if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
    const items: number[] = [1];
    if (cur > 3) items.push(-1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(count - 1, cur + 1); p++) items.push(p);
    if (cur < count - 2) items.push(-1);
    items.push(count);
    return items;
  });

  protected go(p: number): void {
    this.pageChange.emit(p);
  }
}
