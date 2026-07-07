import { useEffect } from "react";
import { useBotEvents } from "@/lib/use-bot-events";
import { BOT_EVENT_META, type BotEventKind } from "@/lib/bot-events";
import { useOptionalChat } from "@/lib/chat-store";

// Listens for open/close transitions from useBotEvents and posts a
// single system message into the currently-active public channel.
export function useBotEventsNotifier() {
  useBotEvents(); // syncs config + emits transition events
  const chat = useOptionalChat();

  useEffect(() => {
    if (!chat) return;
    const seen = new Set<string>();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{
        kind: BotEventKind; live: boolean; cycleId: string;
        duration_min: number; interval_min: number; golden: boolean;
      }>).detail;
      const key = `${detail.cycleId}:${detail.live}`;
      if (seen.has(key)) return;
      seen.add(key);
      const meta = BOT_EVENT_META[detail.kind];
      const channelId = chat.state.activeChannel;
      if (channelId.startsWith("dm:")) return;
      const nextInMin = Math.max(1, detail.interval_min - detail.duration_min);
      const text = detail.live
        ? `${meta.emoji} **${detail.golden ? meta.goldenLabel : meta.label} is now LIVE!** ${detail.golden ? "✨ 2× rewards! " : ""}You have ${detail.duration_min} minutes to type **${meta.command}**.`
        : `⛔ ${meta.emoji} ${meta.label} has ended. Next round in ${nextInMin}m.`;
      chat.pushSystem(channelId, text);
    };
    window.addEventListener("palrgo:bot-event", handler);
    return () => window.removeEventListener("palrgo:bot-event", handler);
  }, [chat]);
}
