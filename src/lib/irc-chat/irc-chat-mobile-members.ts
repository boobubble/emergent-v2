import { isUuid } from "@/lib/dm-utils";
import type { IrcChatMember } from "@/lib/irc-chat";
import type { RemoteProfile } from "@/lib/use-remote-profiles";

function registeredProfileId(member: IrcChatMember): string | null {
  if (member.isGuest) return null;
  if (member.userId.startsWith("visitor_") || member.userId.startsWith("irc:")) return null;
  return isUuid(member.userId) ? member.userId : null;
}

export function formatMembersInRoomCount(count: number): string {
  if (count === 1) return "1 in room";
  return `${count} in room`;
}

export function shouldOfferMemberMessage(isSelf: boolean): boolean {
  return !isSelf;
}

export function shouldOfferViewProfile(member: IrcChatMember): boolean {
  return Boolean(registeredProfileId(member));
}

export function memberProfileBioSnippet(
  profile: RemoteProfile | null,
  maxLen = 160,
): string | null {
  if (!profile) return null;
  const raw = (profile.bio || profile.about_me || "").trim();
  if (!raw) return null;
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, maxLen - 1)}…`;
}

export function memberSheetShowsContextList(showContext: boolean): "list" | "context" {
  return showContext ? "context" : "list";
}
