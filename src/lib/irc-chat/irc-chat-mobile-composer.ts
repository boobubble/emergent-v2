import { IRC_CHAT_BELOW_MD_MQ } from "./irc-chat-mobile-conversation";

export type ComposerPickerKind = "emoji" | "sticker" | "giphy" | "youtube";

export type ComposerPickerFlags = Record<ComposerPickerKind, boolean>;

export const COMPOSER_PICKER_NONE: ComposerPickerFlags = {
  emoji: false,
  sticker: false,
  giphy: false,
  youtube: false,
};

/** Mutual exclusion: at most one overlay picker active; toggling same picker closes all. */
export function resolveExclusiveComposerPicker(
  current: ComposerPickerKind | null,
  requested: ComposerPickerKind,
): ComposerPickerFlags {
  if (current === requested) return { ...COMPOSER_PICKER_NONE };
  return {
    ...COMPOSER_PICKER_NONE,
    [requested]: true,
  };
}

export function activeComposerPicker(flags: ComposerPickerFlags): ComposerPickerKind | null {
  for (const key of Object.keys(flags) as ComposerPickerKind[]) {
    if (flags[key]) return key;
  }
  return null;
}

export function shouldComposerEmitTyping(input: {
  isRoom: boolean;
  connected: boolean;
  draftTrimmed: boolean;
  pickerOpen: boolean;
}): boolean {
  if (!input.isRoom || !input.connected || !input.draftTrimmed) return false;
  return !input.pickerOpen;
}

export function composerMobilePickerMaxHeightPx(visualViewportHeight?: number): number {
  const vh = visualViewportHeight ?? 640;
  return Math.min(Math.round(vh * 0.52), 420);
}

export { IRC_CHAT_BELOW_MD_MQ };
