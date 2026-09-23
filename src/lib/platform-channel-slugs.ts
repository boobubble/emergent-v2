import { YAARZO_GLOBAL_ROOM_ID } from "@/lib/auth-entry";
import { GAMES_CHANNEL_ID } from "@/lib/chat-bot-channels";
import { UUID_RE } from "@/lib/dm-utils";
import { isReservedSlug } from "@/lib/reserved-routes";

/** System slugs that are allowed even when reserved by route table. */
export const PLATFORM_SYSTEM_SLUGS = new Set<string>([
  YAARZO_GLOBAL_ROOM_ID,
  GAMES_CHANNEL_ID,
]);

const BLOCKED_NAMESPACE_PREFIXES = ["dm:", "trio:", "gdm:", "watch:"] as const;

const BLOCKED_EXACT_SLUGS = new Set<string>(["dm", "trio", "gdm", "lobby", "adm"]);

export function slugifyPlatformChannelSlug(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function validatePlatformChannelSlug(
  slug: string,
  opts?: { allowExistingSystem?: boolean },
): string | null {
  const raw = slug.trim().toLowerCase();
  for (const prefix of BLOCKED_NAMESPACE_PREFIXES) {
    if (raw.startsWith(prefix)) {
      return `Slug namespace "${prefix.replace(":", "")}" is reserved.`;
    }
  }
  const normalized = slugifyPlatformChannelSlug(slug);
  if (!normalized) return "Channel slug is required.";
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(normalized)) {
    return "Slug must use lowercase letters, numbers, hyphens, or underscores.";
  }
  if (UUID_RE.test(normalized)) {
    return "UUID-shaped slugs are reserved for community chatrooms.";
  }
  if (BLOCKED_EXACT_SLUGS.has(normalized)) {
    return `Slug "${normalized}" is reserved.`;
  }
  if (!PLATFORM_SYSTEM_SLUGS.has(normalized) && isReservedSlug(normalized)) {
    return `Slug "${normalized}" conflicts with a platform route.`;
  }
  if (opts?.allowExistingSystem && PLATFORM_SYSTEM_SLUGS.has(normalized)) {
    return null;
  }
  if (PLATFORM_SYSTEM_SLUGS.has(normalized)) {
    return `Slug "${normalized}" is reserved for a system channel.`;
  }
  return null;
}
