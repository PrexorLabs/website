const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** A ULID: 48 bits of milliseconds and 80 random bits in Crockford base32, so ids sort by creation time. */
export function ulid(now = Date.now()): string {
  let time = '';
  for (let rest = now, i = 0; i < 10; i++, rest = Math.floor(rest / 32)) {
    time = alphabet[rest % 32] + time;
  }
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => alphabet[byte % 32]).join('');
  return time + random;
}
