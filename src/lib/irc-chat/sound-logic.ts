/** Pure IRC sound decision helpers (no DOM / no AudioContext). */

export function isSelfIrcNick(authorNick: string, selfNick: string | null): boolean {
  if (!selfNick?.trim()) return false;
  return authorNick.trim().toLowerCase() === selfNick.trim().toLowerCase();
}

export function messageMentionsNick(text: string, selfNick: string | null): boolean {
  if (!selfNick?.trim()) return false;
  const nick = selfNick.trim();
  const esc = nick.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`@${esc}\\b`, "i").test(text)) return true;
  return new RegExp(`\\b${esc}\\b`, "i").test(text);
}

export type PublicMessageSoundChoice = "mention" | "public" | null;

function ircRoomNamesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function choosePublicMessageSound(input: {
  roomId: string;
  activeSoundRoom: string | null;
  authorNick: string;
  text: string;
  selfNick: string | null;
  mentionEnabled: boolean;
  publicEnabled: boolean;
}): PublicMessageSoundChoice {
  if (input.activeSoundRoom === null) {
    return null;
  }
  if (!ircRoomNamesMatch(input.roomId, input.activeSoundRoom)) {
    return null;
  }
  if (isSelfIrcNick(input.authorNick, input.selfNick)) {
    return null;
  }
  if (input.mentionEnabled && messageMentionsNick(input.text, input.selfNick)) {
    return "mention";
  }
  if (input.publicEnabled) {
    return "public";
  }
  return null;
}

export function shouldPlayJoinSound(input: {
  event: "join" | "part" | "quit" | "kick" | "nick";
  room: string;
  activeSoundRoom: string | null;
  joinNick: string;
  selfNick: string | null;
  suppressJoinSoundsForRoom: boolean;
  joinEnabled: boolean;
}): boolean {
  if (input.event !== "join") return false;
  if (!input.joinEnabled) return false;
  if (input.suppressJoinSoundsForRoom) return false;
  if (input.activeSoundRoom === null) {
    return false;
  }
  if (!ircRoomNamesMatch(input.room, input.activeSoundRoom)) {
    return false;
  }
  if (isSelfIrcNick(input.joinNick, input.selfNick)) {
    return false;
  }
  return true;
}

export function shouldPlayIncomingPmSound(input: {
  incomingAccepted: boolean;
  pmEnabled: boolean;
}): boolean {
  return input.incomingAccepted && input.pmEnabled;
}
