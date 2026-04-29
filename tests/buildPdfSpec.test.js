import { describe, it, expect } from 'vitest';
import { buildPdfSpec } from '../src/lib.js';

describe('buildPdfSpec — Print-PDF 规格构建', () => {
  it('returns a single-page spec for a 32×32 pattern with one color', () => {
    const pattern = {
      size: 32,
      grid: new Array(32 * 32).fill(0),       // 全 0：单色
      palette: ['#ff0000'],
      title: 'Test pattern',
      author: 'Tester',
    };

    const spec = buildPdfSpec(pattern);

    expect(spec.title).toBe('Test pattern');
    expect(spec.pageSize).toBe('letter');                  // 默认 US Letter
    expect(spec.pages).toHaveLength(2);                    // 1 张图纸 + 1 张图例
    expect(spec.pages[0].kind).toBe('grid');
    expect(spec.pages[0].size).toEqual({ rows: 32, cols: 32 });
    expect(spec.pages[1].kind).toBe('legend');
    expect(spec.pages[1].entries).toHaveLength(1);
    expect(spec.pages[1].entries[0]).toEqual({
      code: 'C1',
      hex: '#ff0000',
      count: 32 * 32,
      percent: 100,
    });
    expect(spec.totalBeads).toBe(32 * 32);
  });

  it('orders legend entries by count descending (regardless of palette order)', () => {
    // 4×4 grid: palette[0]=1 cell, palette[1]=10 cells, palette[2]=5 cells
    // 调色板顺序 ≠ 降序，强制 buildPdfSpec 必须排序
    const grid = [
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 2, 2,
      2, 2, 2, 0,
    ];
    const spec = buildPdfSpec({
      size: 4,
      grid,
      palette: ['#aaa', '#bbb', '#ccc'],
      title: 'mini',
      author: 'x',
    });
    const counts = spec.pages[1].entries.map(e => e.count);
    expect(counts).toEqual([10, 5, 1]);
    // 确保排序后 code 仍能映射回原 hex
    const top = spec.pages[1].entries[0];
    expect(top.hex).toBe('#bbb');
  });

  it('grid page emits ruler markers every 10 cells for a 32×32 pattern', () => {
    const spec = buildPdfSpec({
      size: 32,
      grid: new Array(32 * 32).fill(0),
      palette: ['#000'],
      title: 't',
      author: 'a',
    });
    const grid = spec.pages[0];
    // 每 10 格一标记（含 0 和最后一格 31）→ rulers: [0,10,20,30,31]
    expect(grid.rulers).toEqual([0, 10, 20, 30, 31]);
  });

  it('large patterns split across multiple grid pages (max 48 cells per page)', () => {
    // 96×96 → 应拆 2×2 = 4 张 grid 页
    const size = 96;
    const spec = buildPdfSpec({
      size,
      grid: new Array(size * size).fill(0),
      palette: ['#000'],
      title: 'big',
      author: 'a',
    });
    const gridPages = spec.pages.filter(p => p.kind === 'grid');
    expect(gridPages).toHaveLength(4);
    // 每页都标注自己负责的子区
    expect(gridPages[0].region).toEqual({ row: 0, col: 0, rows: 48, cols: 48 });
    expect(gridPages[1].region).toEqual({ row: 0, col: 48, rows: 48, cols: 48 });
    expect(gridPages[2].region).toEqual({ row: 48, col: 0, rows: 48, cols: 48 });
    expect(gridPages[3].region).toEqual({ row: 48, col: 48, rows: 48, cols: 48 });
  });

  it('legend entries include percent of total beads (rounded to 1 decimal)', () => {
    const grid = [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 1, 1,
      1, 1, 1, 2,
    ];
    const spec = buildPdfSpec({
      size: 4, grid, palette: ['#aaa','#bbb','#ccc'], title: 't', author: 'a',
    });
    const ents = spec.pages.find(p => p.kind === 'legend').entries;
    // 10/16=62.5, 5/16=31.25→31.3 (1 decimal), 1/16=6.25→6.3 (1 decimal)
    expect(ents[0].percent).toBe(62.5);
    expect(ents[1].percent).toBe(31.3);
    expect(ents[2].percent).toBe(6.3);
  });

  it('rulers always include 0, every multiple of 10 strictly inside, and last index', () => {
    const spec23 = buildPdfSpec({
      size: 23, grid: new Array(23 * 23).fill(0),
      palette: ['#000'], title: 't', author: 'a',
    });
    expect(spec23.pages[0].rulers).toEqual([0, 10, 20, 22]);

    const spec10 = buildPdfSpec({
      size: 10, grid: new Array(100).fill(0),
      palette: ['#000'], title: 't', author: 'a',
    });
    // last index is 9; never include the size value (10) itself
    expect(spec10.pages[0].rulers).toEqual([0, 9]);
  });

  it('rulers handle minimal size=1 and the guard-triggering size=11', () => {
    const spec1 = buildPdfSpec({
      size: 1, grid: [0],
      palette: ['#000'], title: 't', author: 'a',
    });
    expect(spec1.pages[0].rulers).toEqual([0]);

    const spec11 = buildPdfSpec({
      size: 11, grid: new Array(121).fill(0),
      palette: ['#000'], title: 't', author: 'a',
    });
    // i=10 equals last=10, must not be duplicated
    expect(spec11.pages[0].rulers).toEqual([0, 10]);
  });
});
