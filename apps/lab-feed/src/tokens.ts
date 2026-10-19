export type Scope = 'events:write' | 'events:hide';

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** True when the request carries a bearer token that exists and has the scope. */
export async function authorized(request: Request, db: D1Database, scope: Scope): Promise<boolean> {
  const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return false;
  const row = await db
    .prepare('SELECT scopes FROM api_tokens WHERE hash = ?')
    .bind(await sha256(token))
    .first<{ scopes: string }>();
  return row !== null && row.scopes.split(' ').includes(scope);
}
