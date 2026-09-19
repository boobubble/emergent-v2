import { describe, expect, it, vi } from "vitest";
import {
  createIrcTypingEmitter,
  formatTypingIndicatorLabel,
  IRC_TYPING_HEARTBEAT_MS,
} from "./irc-typing-client";

describe("irc typing client", () => {
  it("formats one, two, and many typers", () => {
    expect(
      formatTypingIndicatorLabel([{ userId: "a", nick: "Ranjha" }], "me"),
    ).toBe("Ranjha is typing…");
    expect(
      formatTypingIndicatorLabel(
        [
          { userId: "a", nick: "Ranjha" },
          { userId: "b", nick: "Sana" },
        ],
        "me",
      ),
    ).toBe("Ranjha and Sana are typing…");
    expect(
      formatTypingIndicatorLabel(
        [
          { userId: "a", nick: "A" },
          { userId: "b", nick: "B" },
          { userId: "c", nick: "C" },
        ],
        "me",
      ),
    ).toBe("3 people are typing…");
  });

  it("throttles start frames while typing", () => {
    vi.useFakeTimers();
    const start = vi.fn();
    const stop = vi.fn();
    const emitter = createIrcTypingEmitter({ start, stop });
    emitter.sendTyping();
    emitter.sendTyping();
    expect(start).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(IRC_TYPING_HEARTBEAT_MS + 10);
    emitter.sendTyping();
    expect(start).toHaveBeenCalledTimes(2);
    emitter.dispose();
    vi.useRealTimers();
  });
});
