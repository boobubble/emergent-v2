// Lightweight Web Audio sound effects (no asset files).
let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Soft two-tone "ping" for incoming DMs. */
export function playDmPing() {
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") ac.resume();
    const now = ac.currentTime;
    const tones = [880, 1320];
    tones.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.28, now + i * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.22);
      osc.connect(gain).connect(ac.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  } catch {
    /* ignore */
  }
}

/** Short rising chirp for @mentions. Distinct from DM ping. */
export function playMentionPing() {
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") ac.resume();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1900, now + 0.12);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    /* ignore */
  }
}
