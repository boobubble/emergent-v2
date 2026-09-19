import { describe, expect, it } from "vitest";
import {
  activeComposerPicker,
  composerMobilePickerMaxHeightPx,
  resolveExclusiveComposerPicker,
  shouldComposerEmitTyping,
} from "./irc-chat-mobile-composer";

describe("irc-chat mobile composer", () => {
  it("exclusive picker toggles and switches", () => {
    expect(resolveExclusiveComposerPicker(null, "emoji")).toEqual({
      emoji: true,
      sticker: false,
      giphy: false,
      youtube: false,
    });
    expect(resolveExclusiveComposerPicker("emoji", "emoji")).toEqual({
      emoji: false,
      sticker: false,
      giphy: false,
      youtube: false,
    });
    expect(resolveExclusiveComposerPicker("emoji", "sticker").sticker).toBe(true);
    expect(resolveExclusiveComposerPicker("emoji", "sticker").emoji).toBe(false);
  });

  it("detects active picker", () => {
    expect(
      activeComposerPicker({
        emoji: false,
        sticker: true,
        giphy: false,
        youtube: false,
      }),
    ).toBe("sticker");
  });

  it("suppresses typing while a picker overlay is open", () => {
    expect(
      shouldComposerEmitTyping({
        isRoom: true,
        connected: true,
        draftTrimmed: true,
        pickerOpen: true,
      }),
    ).toBe(false);
    expect(
      shouldComposerEmitTyping({
        isRoom: true,
        connected: true,
        draftTrimmed: true,
        pickerOpen: false,
      }),
    ).toBe(true);
  });

  it("bounds mobile picker height to visual viewport", () => {
    expect(composerMobilePickerMaxHeightPx(800)).toBe(416);
    expect(composerMobilePickerMaxHeightPx(400)).toBe(208);
  });
});
