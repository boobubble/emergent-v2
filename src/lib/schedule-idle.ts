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

/**
 * Guest homepage: wait for first user input, or `timeoutMs`, whichever comes
 * first. Keeps ads/analytics off the H1 critical path without disabling them.
 */
export function scheduleAfterInteraction(fn: () => void, timeoutMs = 8000): () => void {
  if (typeof window === "undefined") return () => {};
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("scroll", run);
    window.removeEventListener("touchstart", run);
    fn();
  };
  const opts: AddEventListenerOptions = { once: true, passive: true };
  window.addEventListener("pointerdown", run, opts);
  window.addEventListener("keydown", run, opts);
  window.addEventListener("scroll", run, opts);
  window.addEventListener("touchstart", run, opts);
  const timer = window.setTimeout(run, timeoutMs);
  return () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("scroll", run);
    window.removeEventListener("touchstart", run);
  };
}
