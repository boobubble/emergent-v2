import { useEffect } from "react";
import { useBotEvents } from "@/lib/use-bot-events";
import { BOT_EVENT_META, type BotEventKind } from "@/lib/bot-events";
import { useOptionalChat } from "@/lib/chat-store";
import type { Message } from "@/lib/chat-types";

// Listens for open/close transitions from useBotEvents and pushes a
// single system message into the currently-active channel. Also keeps
// the module-level bot-events config in sync via useBotEvents itself.
export function useBotEventsNotifier() {
  useBotEvents(); // syncs config + emits transition events
  const chat = useOptionalChat();

  useEffect(() => {
    if (!chat) return;
    const seen = new Set<string>();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ kind: BotEventKind; live: boolean; cycleId: string; duration_min: number; interval_min: number; golden: boolean }>).detail;
      const key = `${detail.cycleId}:${detail.live}`;
      if (seen.has(key)) return;
      seen.add(key);
      const meta = BOT_EVENT_META[detail.kind];
      const channelId = chat.state.activeChannel;
      // Only announce in public rooms
      if (channelId.startsWith("dm:")) return;
      const text = detail.live
        ? `${meta.emoji} **${detail.golden ? meta.goldenLabel : meta.label} is now LIVE!** ${detail.golden ? "✨ 2× rewards! " : ""}You have ${detail.duration_min} minutes to type **${meta.command}**.`
        : `⛔ ${meta.emoji} ${meta.label} has ended. Next round in ${detail.interval_min - detail.duration_min}m.`;
      const msg: Message = {
        id: `bot-evt-${key}`,
        channelId,
        authorId: meta.botId,
        ts: Date.now(),
        text,
        kind: "system",
      };
      // Push directly into state via a synthetic setter is not exposed;
      // fall back to the public `send`-adjacent path: dispatch a custom
      // event MessageList could render. Simpler: reuse chat state by
      // appending through a lightweight window event that MessageList
      // ignores — instead we rely on chat.pushSystemMessage if exposed.
      const anyChat = chat as unknown as { pushSystemMessage?: (m: Message) => void };
      if (anyChat.pushSystemMessage) anyChat.pushSystemMessage(msg);
      else window.dispatchEvent(new CustomEvent("palrgo:bot-event-notice", { detail: { message: msg } }));
    };
    window.addEventListener("palrgo:bot-event", handler);
    return () => window.removeEventListener("palrgo:bot-event", handler);
  }, [chat]);
}
