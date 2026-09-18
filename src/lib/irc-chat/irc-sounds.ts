import { canPlaySound } from "@/lib/sound-prefs";
import {
  playDmPing,
  playMentionPing,
  playPublicChatTick,
  playUserJoinTick,
} from "@/lib/sounds";
import {
  choosePublicMessageSound,
  shouldPlayIncomingPmSound,
  shouldPlayJoinSound,
} from "./sound-logic";

export type IrcChatSoundPlayer = {
  playPublicChatTick: () => void;
  playMentionPing: () => void;
  playDmPing: () => void;
  playUserJoinTick: () => void;
};

export const defaultIrcChatSoundPlayer: IrcChatSoundPlayer = {
  playPublicChatTick,
  playMentionPing,
  playDmPing,
  playUserJoinTick,
};

export function playPublicMessageSoundEffects(input: {
  roomId: string;
  activeSoundRoom: string | null;
  authorNick: string;
  text: string;
  selfNick: string | null;
  player: IrcChatSoundPlayer;
}): void {
  const choice = choosePublicMessageSound({
    roomId: input.roomId,
    activeSoundRoom: input.activeSoundRoom,
    authorNick: input.authorNick,
    text: input.text,
    selfNick: input.selfNick,
    mentionEnabled: canPlaySound("username_mention"),
    publicEnabled: canPlaySound("public_chat"),
  });
  if (choice === "mention") {
    input.player.playMentionPing();
  } else if (choice === "public") {
    input.player.playPublicChatTick();
  }
}

export function playJoinSoundEffect(input: {
  room: string;
  activeSoundRoom: string | null;
  joinNick: string;
  selfNick: string | null;
  suppressJoinSoundsForRoom: boolean;
  player: IrcChatSoundPlayer;
}): void {
  if (
    shouldPlayJoinSound({
      event: "join",
      room: input.room,
      activeSoundRoom: input.activeSoundRoom,
      joinNick: input.joinNick,
      selfNick: input.selfNick,
      suppressJoinSoundsForRoom: input.suppressJoinSoundsForRoom,
      joinEnabled: canPlaySound("user_join"),
    })
  ) {
    input.player.playUserJoinTick();
  }
}

export function playIncomingPmSoundEffect(input: {
  incomingAccepted: boolean;
  player: IrcChatSoundPlayer;
}): void {
  if (
    shouldPlayIncomingPmSound({
      incomingAccepted: input.incomingAccepted,
      pmEnabled: canPlaySound("private_chat"),
    })
  ) {
    input.player.playDmPing();
  }
}
