import { describe, expect, it } from "vitest";
import {
  computeReactionPickerPlacement,
  mobileReplyPreviewMaxChars,
} from "./irc-chat-mobile-conversation";

describe("irc-chat mobile conversation helpers", () => {
  it("shortens reply preview copy on mobile shell", () => {
    expect(mobileReplyPreviewMaxChars(true)).toBe(120);
    expect(mobileReplyPreviewMaxChars(false)).toBe(160);
  });

  it("flips reaction picker horizontally near the right edge", () => {
    const placement = computeReactionPickerPlacement({
      anchorLeft: 320,
      anchorTop: 200,
      anchorBottom: 240,
      viewportWidth: 390,
      viewportHeight: 844,
      pickerWidth: 168,
      pickerHeight: 40,
    });
    expect(placement.alignEnd).toBe(true);
    expect(placement.openBelow).toBe(false);
  });

  it("opens reaction picker below when there is no room above", () => {
    const placement = computeReactionPickerPlacement({
      anchorLeft: 40,
      anchorTop: 12,
      anchorBottom: 52,
      viewportWidth: 360,
      viewportHeight: 640,
      pickerWidth: 168,
      pickerHeight: 40,
    });
    expect(placement.openBelow).toBe(true);
  });
});
