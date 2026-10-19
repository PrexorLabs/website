// Cuts Geist and Geist Mono down to the characters and weights the site uses and writes them to src/lib/ui/fonts/.
// The full Latin files from Fontsource weigh 51 KB together, which alone would take half the page budget.
// Run it after adding a weight or a character outside the ranges below; the results are committed.

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const out = new URL('../src/lib/ui/fonts/', import.meta.url);

const ranges = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xff], // Latin-1: umlauts, ß, ©, ·, ×
  [0x2010, 0x2027], // dashes, quotes, ellipsis, bullet
  [0x2190, 0x2193], // arrows
  [0x2212, 0x2212], // minus
];
const text = ranges
  .flatMap(([from, to]) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)))
  .join('');

const fonts = [
  { file: '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2', name: 'geist.woff2', weight: [400, 600] },
  {
    file: '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
    name: 'geist-mono.woff2',
    weight: [400, 500],
  },
];

for (const font of fonts) {
  const source = readFileSync(require.resolve(font.file));
  const [min, max] = font.weight;
  const subset = await subsetFont(source, text, { targetFormat: 'woff2', variationAxes: { wght: { min, max } } });
  writeFileSync(new URL(font.name, out), subset);
  console.log(`${font.name}: ${(source.length / 1024).toFixed(1)} KB -> ${(subset.length / 1024).toFixed(1)} KB`);
}
