import { useBotEvents } from "@/lib/use-bot-events";
import { BOT_EVENT_META, type BotEventState } from "@/lib/bot-events";

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function EventPill({ state }: { state: BotEventState }) {
  const meta = BOT_EVENT_META[state.kind];
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium shadow-sm ${
      state.live
        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
        : "border-border/60 bg-background/60 text-muted-foreground"
    }`}>
      <span className="text-sm leading-none">{meta.emoji}</span>
      <span className="font-bold uppercase tracking-wider text-[10px]">
        {meta.label.replace(" Event", "")}
      </span>
      {state.live ? (
        <>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-bold">LIVE</span>
          <span className="opacity-80">· ends {fmt(state.msUntilClose)}</span>
          {state.golden && <span className="rounded-full bg-amber-400/30 px-1.5 font-bold text-amber-100">✨ 2×</span>}
        </>
      ) : (
        <span className="opacity-80">in {fmt(state.msUntilOpen)}</span>
      )}
    </div>
  );
}

export function BotEventsPanel() {
  const { states, config } = useBotEvents();
  const kinds = (["fish", "dig", "wine"] as const).filter((k) => config[k].enabled);
  if (kinds.length === 0) return null;
  return (
    <div className="mx-3 mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-border/50 bg-card/40 px-3 py-2 backdrop-blur-md">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Community events
      </span>
      {kinds.map((k) => <EventPill key={k} state={states[k]} />)}
    </div>
  );
}
