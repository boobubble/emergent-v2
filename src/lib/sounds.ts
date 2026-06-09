// Lightweight Web Audio sound effects (no asset files).
import { canPlaySound, type SoundKind } from "./sound-prefs";

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

function gated(kind: SoundKind, fn: () => void) {
  if (!canPlaySound(kind)) return;
  fn();
}

/** Soft two-tone "ping" for incoming DMs. */
export function playDmPing() {
  gated("private_chat", () => {
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
    } catch { /* ignore */ }
  });
}

/** Short rising chirp for @mentions. Distinct from DM ping. */
export function playMentionPing() {
  gated("username_mention", () => {
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
      gain.gain.linearRampToValueAtTime(0.32, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.connect(gain).connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch { /* ignore */ }
  });
}

/** Soft tick for new public room messages. */
export function playPublicChatTick() {
  gated("public_chat", () => {
    const ac = getCtx();
    if (!ac) return;
    try {
      if (ac.state === "suspended") ac.resume();
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(620, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain).connect(ac.destination);
      osc.start(now); osc.stop(now + 0.15);
    } catch { /* ignore */ }
  });
}

/** Generic notification ping (friend post, like, reply). */
export function playNotificationPing() {
  gated("notifications", () => {
    const ac = getCtx();
    if (!ac) return;
    try {
      if (ac.state === "suspended") ac.resume();
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.08);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.connect(gain).connect(ac.destination);
      osc.start(now); osc.stop(now + 0.22);
    } catch { /* ignore */ }
  });
}

/** Repeating ring for incoming voice/video calls. Returns a stop function. */
export function playCallRing(): () => void {
  if (!canPlaySound("calls")) return () => { /* noop */ };
  const ac = getCtx();
  if (!ac) return () => { /* noop */ };
  let stopped = false;
  const intervalId = window.setInterval(() => {
    if (stopped || !canPlaySound("calls")) return;
    try {
      if (ac.state === "suspended") ac.resume();
      const now = ac.currentTime;
      [0, 0.25].forEach((off) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now + off);
        gain.gain.setValueAtTime(0, now + off);
        gain.gain.linearRampToValueAtTime(0.3, now + off + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + off + 0.22);
        osc.connect(gain).connect(ac.destination);
        osc.start(now + off); osc.stop(now + off + 0.24);
      });
    } catch { /* ignore */ }
  }, 1500);
  return () => { stopped = true; window.clearInterval(intervalId); };
}
