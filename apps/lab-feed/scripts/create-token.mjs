// Creates a write token for a client of the lab feed, for example the Discord bot:
//   pnpm --filter @prexorlabs/lab-feed token prexor-bot "events:write events:hide"
// The token is printed once; the database only keeps its SHA-256, so a lost token is replaced, not recovered.

import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';

const [name, scopes] = process.argv.slice(2);
const known = ['events:write', 'events:hide'];
if (!name || !scopes || scopes.split(' ').some((scope) => !known.includes(scope))) {
  console.error(`usage: pnpm token <name> "<scopes>", scopes from: ${known.join(', ')}`);
  process.exit(1);
}

const token = `plf_${randomBytes(32).toString('base64url')}`;
const hash = createHash('sha256').update(token).digest('hex');
const quote = (text) => `'${text.replaceAll("'", "''")}'`;
const sql = `INSERT INTO api_tokens (hash, name, scopes, created_at) VALUES (${quote(hash)}, ${quote(name)}, ${quote(scopes)}, ${quote(new Date().toISOString())})`;

execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'LAB', '--remote', '--command', sql], { stdio: 'inherit' });
console.log(`\nToken for ${name}, shown only now:\n${token}`);
