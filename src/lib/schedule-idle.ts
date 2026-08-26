/** Run after first paint. Used to defer ads/analytics on the guest homepage. */
export function scheduleIdle(fn: () => void, timeoutMs = 3500): () => void {
  if (typeof window === "undefined") return () => {};
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }
  ).requestIdleCallback;
  if (typeof ric === "function") {
    const id = ric(fn, { timeout: timeoutMs });
    return () => window.cancelIdleCallback?.(id);
  }
  const t = window.setTimeout(fn, Math.min(timeoutMs, 2000));
  return () => window.clearTimeout(t);
}
