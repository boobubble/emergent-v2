import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { highlightMessage } from "@/lib/economy.functions";
import { SPEND } from "@/lib/economy-config";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Spend coins to highlight a chat message for 1h. No-op unless messageId is a real DB UUID. */
export function HighlightButton({ messageId, channelId }: { messageId: string; channelId: string }) {
  const buy = useServerFn(highlightMessage);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!UUID_RE.test(messageId)) return null;

  async function onClick() {
    if (busy || done) return;
    if (!confirm(`Highlight this message for 1 hour? Costs ${SPEND.highlight_message.coins} coins.`)) return;
    setBusy(true);
    try {
      await buy({ data: { messageId, channelId } });
      setDone(true);
    } catch (e) {
      alert((e as Error).message ?? "Couldn't highlight");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy || done}
      className={`opacity-0 transition-opacity group-hover/msg:opacity-100 ${done ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}
      title={done ? "Highlighted" : `Highlight (${SPEND.highlight_message.coins} coins)`}
      aria-label="Highlight message"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
    </button>
  );
}
