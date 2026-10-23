// Cuts Fraunces and Instrument Sans down to the characters, weights and axes the site uses and writes them to
// src/lib/fonts/. The full Latin files from Fontsource weigh about 150 KB together, more than the page budget.
// Run it after adding a weight or a character outside the ranges below; the results are committed.

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const out = new URL('../src/lib/fonts/', import.meta.url);

const ranges = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xff], // Latin-1: umlauts, ß, ©, ·
  [0x2010, 0x2027], // dashes, quotes, ellipsis, bullet
];
const text = ranges
  .flatMap(([from, to]) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)))
  .join('');

const fonts = [
  {
    file: '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2',
    name: 'fraunces.woff2',
    // Pinned to the one cut the site uses: regular weight, display optical size, corners softened a little and the
    // letters upright. Keeping the axes free would triple the file.
    axes: { wght: 400, opsz: 96, SOFT: 50, WONK: 0 },
  },
  {
    file: '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
    name: 'instrument-sans.woff2',
    axes: { wght: { min: 400, max: 600 } },
  },
];

for (const font of fonts) {
  const source = readFileSync(require.resolve(font.file));
  const subset = await subsetFont(source, text, { targetFormat: 'woff2', variationAxes: font.axes });
  writeFileSync(new URL(font.name, out), subset);
  console.log(`${font.name}: ${(source.length / 1024).toFixed(1)} KB -> ${(subset.length / 1024).toFixed(1)} KB`);
}
