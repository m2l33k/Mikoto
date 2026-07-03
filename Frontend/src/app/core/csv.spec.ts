import { vi } from 'vitest';
import { downloadCsv } from './csv';

describe('downloadCsv', () => {
  let capturedBlob: Blob | null;
  let anchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    capturedBlob = null;
    anchor = { href: '', download: '', click: vi.fn() };

    vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => {
      capturedBlob = b as Blob;
      return 'blob:mock';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLElement);
  });

  afterEach(() => vi.restoreAllMocks());

  async function csvText(): Promise<string> {
    expect(capturedBlob).not.toBeNull();
    return capturedBlob!.text();
  }

  it('builds CRLF-joined rows with every cell quoted', async () => {
    downloadCsv('report', ['id', 'name'], [[1, 'alpha'], [2, 'beta']]);
    expect(await csvText()).toBe('"id","name"\r\n"1","alpha"\r\n"2","beta"');
  });

  it('escapes embedded double quotes', async () => {
    downloadCsv('report', ['note'], [['say "hi"']]);
    expect(await csvText()).toBe('"note"\r\n"say ""hi"""');
  });

  it('appends .csv only when missing and triggers the download', () => {
    downloadCsv('report', ['a'], []);
    expect(anchor.download).toBe('report.csv');
    expect(anchor.click).toHaveBeenCalledTimes(1);

    downloadCsv('data.csv', ['a'], []);
    expect(anchor.download).toBe('data.csv');
  });
});
