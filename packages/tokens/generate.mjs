// Turns tokens.json into CSS variables, named exactly like the launcher's so components look the same in both.
// `--check` fails instead of writing when tokens.css is out of date (used by CI).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('./', import.meta.url));
const tokens = JSON.parse(readFileSync(`${dir}tokens.json`, 'utf8'));
const check = process.argv.includes('--check');

const groups = [
  { name: 'color', unit: '' },
  { name: 'space', unit: 'px' },
  { name: 'radius', unit: 'px' },
  { name: 'font-size', unit: 'px' },
  { name: 'duration', unit: 'ms' },
];
const fallback = { sans: 'system-ui, sans-serif', mono: 'ui-monospace, monospace' };

const lines = ['/* Generated from tokens.json by generate.mjs. Do not edit. */', ':root {'];
for (const { name, unit } of groups) {
  for (const [key, value] of Object.entries(tokens[name])) {
    lines.push(`  --${name}-${key}: ${value}${unit};`);
  }
}
for (const [key, family] of Object.entries(tokens['font-family'])) {
  lines.push(`  --font-${key}: '${family}', ${fallback[key]};`);
}
lines.push('}', '');
const css = lines.join('\n');

const file = `${dir}tokens.css`;
let current = null;
try {
  current = readFileSync(file, 'utf8');
} catch {
  // Missing file: written below, or reported as stale with --check.
}
if (current !== css) {
  if (check) {
    console.error('packages/tokens/tokens.css is out of date, run `pnpm tokens`');
    process.exit(1);
  }
  writeFileSync(file, css);
  console.log('wrote packages/tokens/tokens.css');
}
