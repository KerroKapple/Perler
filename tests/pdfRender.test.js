import { describe, it, expect, vi } from 'vitest';
import { drawPdf } from '../src/pdf-render.js';

function makeFakePdf() {
  const calls = { addPage: 0, text: [] };
  return {
    instance: {
      addPage: vi.fn(() => { calls.addPage++; }),
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      setFillColor: vi.fn(),
      setDrawColor: vi.fn(),
      rect: vi.fn(),
      text: vi.fn((...a) => calls.text.push(a)),
      output: vi.fn(() => 'BLOB'),
      internal: { pageSize: { getWidth: () => 612, getHeight: () => 792 } },
    },
    calls,
  };
}

describe('drawPdf — render spec into jsPDF instance', () => {
  it('returns the output blob and adds 1 page-break per spec page after the first', () => {
    const fake = makeFakePdf();
    const Ctor = vi.fn(() => fake.instance);

    const spec = {
      title: 'Hello',
      pageSize: 'letter',
      totalBeads: 16,
      pages: [
        { kind: 'grid', size: { rows: 4, cols: 4 }, rulers: [0, 3] },
        { kind: 'legend', entries: [{ code: 'C1', hex: '#000', count: 16, percent: 100 }] },
      ],
    };

    const out = drawPdf(spec, Ctor);

    expect(Ctor).toHaveBeenCalledOnce();
    expect(fake.calls.addPage).toBe(1); // 2 spec pages = 1 addPage (first is implicit)
    expect(out).toBe('BLOB');
  });

  it('writes the title once on the first grid page', () => {
    const fake = makeFakePdf();
    const Ctor = vi.fn(() => fake.instance);
    drawPdf({
      title: 'My Pattern',
      pageSize: 'letter',
      totalBeads: 1,
      pages: [{ kind: 'grid', size: { rows: 1, cols: 1 }, rulers: [0] }],
    }, Ctor);
    const titleCalls = fake.calls.text.filter(c => c[0] === 'My Pattern');
    expect(titleCalls).toHaveLength(1);
  });

  it('emits the title on the first GRID page even if a legend page is first', () => {
    const fake = makeFakePdf();
    const Ctor = vi.fn(() => fake.instance);
    drawPdf({
      title: 'Legend-First Pattern',
      pageSize: 'letter',
      totalBeads: 1,
      pages: [
        { kind: 'legend', entries: [{ code: 'C1', hex: '#000', count: 1, percent: 100 }] },
        { kind: 'grid', size: { rows: 1, cols: 1 }, rulers: [0] },
      ],
    }, Ctor);
    const titleCalls = fake.calls.text.filter(c => c[0] === 'Legend-First Pattern');
    expect(titleCalls).toHaveLength(1);
  });
});
