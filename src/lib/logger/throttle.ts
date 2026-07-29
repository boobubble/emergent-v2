const THROTTLE_MS = 60_000;
const seen = new Map<string, number>();

export function shouldLog(key: string): boolean {
  const now = Date.now();
  const last = seen.get(key) ?? 0;
  if (now - last < THROTTLE_MS) return false;
  seen.set(key, now);
  if (seen.size > 500) {
    const cutoff = now - THROTTLE_MS * 2;
    for (const [k, t] of seen) {
      if (t < cutoff) seen.delete(k);
    }
  }
  return true;
}

export function throttleKey(message: string, extra?: string): string {
  return `${message}::${extra ?? ""}`.slice(0, 240);
}
