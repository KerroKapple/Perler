import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dir, '..', 'index.html'), 'utf8');

describe('index.html UI smoke checks', () => {
  it('imports buildPdfSpec and gridFromImageData from local ESM module', () => {
    expect(html).toMatch(/import\s*\{[^}]*buildPdfSpec[^}]*\}\s*from\s*['"]\.\/src\/lib\.js['"]/);
    expect(html).toMatch(/import\s*\{[^}]*gridFromImageData[^}]*\}\s*from\s*['"]\.\/src\/lib\.js['"]/);
  });

  it('imports drawPdf from local ESM module', () => {
    expect(html).toMatch(/import\s*\{\s*drawPdf\s*\}\s*from\s*['"]\.\/src\/pdf-render\.js['"]/);
  });

  it('loads jsPDF UMD from cdn.jsdelivr.net (jspdf@2)', () => {
    expect(html).toMatch(/cdn\.jsdelivr\.net\/npm\/jspdf@2/);
  });

  it('preview action bar shows "Download PDF" not "Download PNG"', () => {
    expect(html).not.toMatch(/Download PNG/);
    expect(html).toMatch(/Download PDF/);
  });

  it('main inline script tag is type="module"', () => {
    // Find a `<script type="module">` near the bottom that contains import statements
    expect(html).toMatch(/<script\s+type="module"[^>]*>[\s\S]*import\s+\{[^}]*\}\s*from\s*['"]\.\/src\/lib\.js['"]/);
  });
});
