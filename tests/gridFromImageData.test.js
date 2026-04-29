import { describe, it, expect } from 'vitest';
import { gridFromImageData } from '../src/lib.js';

describe('gridFromImageData — RGBA → palette index grid', () => {
  it('maps each pixel to the nearest palette index by squared distance', () => {
    // 2×2 image: red, red, green, blue
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
    ]);
    const palette = ['#ff0000', '#00ff00', '#0000ff'];
    const grid = gridFromImageData(data, 2, 2, palette);
    expect(grid).toEqual([0, 0, 1, 2]);
  });

  it('snaps near-matches to the closest palette color', () => {
    const data = new Uint8ClampedArray([
      250, 5, 5, 255,    // very close to red
      5, 250, 5, 255,    // very close to green
    ]);
    const palette = ['#ff0000', '#00ff00'];
    const grid = gridFromImageData(data, 2, 1, palette);
    expect(grid).toEqual([0, 1]);
  });
});
