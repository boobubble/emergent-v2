/** Companion to `CHATROOM_MD_MQ` — IRC mobile conversation styles apply below `md`. */
export const IRC_CHAT_BELOW_MD_MQ = "(max-width: 767.98px)";

export type ReactionPickerPlacement = {
  alignEnd: boolean;
  openBelow: boolean;
};

/** Keep the four-reaction picker inside the visual viewport on narrow screens. */
export function computeReactionPickerPlacement(input: {
  anchorLeft: number;
  anchorTop: number;
  anchorBottom: number;
  viewportWidth: number;
  viewportHeight: number;
  pickerWidth: number;
  pickerHeight: number;
  edgePadding?: number;
}): ReactionPickerPlacement {
  const pad = input.edgePadding ?? 8;
  const alignEnd =
    input.anchorLeft + input.pickerWidth > input.viewportWidth - pad;
  const spaceAbove = input.anchorTop;
  const spaceBelow = input.viewportHeight - input.anchorBottom;
  const openBelow =
    spaceAbove < input.pickerHeight + pad &&
    spaceBelow >= input.pickerHeight + pad;
  return { alignEnd, openBelow };
}

export function mobileReplyPreviewMaxChars(isMobileShell: boolean): number {
  return isMobileShell ? 120 : 160;
}
