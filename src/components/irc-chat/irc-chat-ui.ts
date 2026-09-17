/** Stable accent hue from IRC nick for avatar fallbacks. */
export function nickAvatarHue(nick: string): number {
  let hash = 0;
  for (let i = 0; i < nick.length; i += 1) {
    hash = nick.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function nickInitial(nick: string): string {
  const trimmed = nick.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export function formatRoomLabel(name: string): string {
  const trimmed = name.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}
