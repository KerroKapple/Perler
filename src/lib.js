// BeadLab pure logic module — ESM, browser & vitest 同源
// 添加新函数前必须先有失败的测试（TDD Iron Law）

const PAGE_MAX = 48; // 单页 grid 最大边长

function makeRulers(size) {
  const last = size - 1;
  const r = [];
  for (let i = 0; i < size; i += 10) {
    if (i !== last) r.push(i);
  }
  r.push(last);
  return r;
}

const LEGEND_PER_PAGE = 36;

function makeLegendPages(entries) {
  const pages = [];
  for (let i = 0; i < entries.length; i += LEGEND_PER_PAGE) {
    pages.push({ kind: 'legend', entries: entries.slice(i, i + LEGEND_PER_PAGE) });
  }
  return pages.length ? pages : [{ kind: 'legend', entries: [] }];
}

function makeGridPages(size) {
  if (size <= PAGE_MAX) {
    return [{ kind: 'grid', size: { rows: size, cols: size }, rulers: makeRulers(size) }];
  }
  const pages = [];
  for (let row = 0; row < size; row += PAGE_MAX) {
    for (let col = 0; col < size; col += PAGE_MAX) {
      const rows = Math.min(PAGE_MAX, size - row);
      const cols = Math.min(PAGE_MAX, size - col);
      pages.push({
        kind: 'grid',
        size: { rows, cols },
        rulers: makeRulers(rows),
        region: { row, col, rows, cols },
      });
    }
  }
  return pages;
}

function hexToRgb(h) {
  const v = h.replace('#', '');
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

export function gridFromImageData(rgba, width, height, palette) {
  const pal = palette.map(hexToRgb);
  const out = new Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
    let best = 0, bd = Infinity;
    for (let p = 0; p < pal.length; p++) {
      const dr = r - pal[p][0], dg = g - pal[p][1], db = b - pal[p][2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bd) { bd = d; best = p; }
    }
    out[i] = best;
  }
  return out;
}

/**
 * Build a printable-PDF spec from a finished bead pattern.
 * Returns a plain JS object describing pages — rendering is the caller's job.
 * @param {{size:number, grid:number[], palette:string[], title:string, author:string}} pattern
 */
export function buildPdfSpec(pattern) {
  const { size, grid, palette, title } = pattern;
  const counts = new Array(palette.length).fill(0);
  for (const idx of grid) counts[idx]++;
  const total = grid.length;
  const entries = palette
    .map((hex, i) => ({ code: 'C' + (i + 1), hex, count: counts[i], percent: Math.round((counts[i] / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);
  return {
    title,
    pageSize: 'letter',
    pages: [
      ...makeGridPages(size),
      ...makeLegendPages(entries),
    ],
    totalBeads: grid.length,
  };
}
