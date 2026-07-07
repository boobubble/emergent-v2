import { useBotEvents } from "@/lib/use-bot-events";
import { BOT_EVENT_META, type BotEventKind, type BotEventState } from "@/lib/bot-events";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function fmtShort(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 10 && s > 0) return `${m}m ${s}s`;
  return `${m}m`;
}

function fmtLong(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

interface Cfg {
  interval_min: number;
  duration_min: number;
}

function EventBadge({ kind, state, cfg }: { kind: BotEventKind; state: BotEventState; cfg: Cfg }) {
  const meta = BOT_EVENT_META[kind];
  const shortName = meta.label.replace(" Event", "");
  const endingSoon = state.live && state.msUntilClose <= 60_000;

  let dot: string | null = null;
  let text: string;
  let tone = "text-muted-foreground";

  if (state.live) {
    if (endingSoon) {
      dot = "bg-rose-400";
      text = `${shortName} Ending (${fmtShort(state.msUntilClose)})`;
      tone = "text-rose-200";
    } else {
      dot = "bg-emerald-400";
      text = `${shortName} LIVE (${fmtShort(state.msUntilClose)} left)`;
      tone = "text-emerald-200";
    }
  } else {
    text = `${shortName} in ${fmtShort(state.msUntilOpen)}`;
  }

  const remaining = state.live ? fmtLong(state.msUntilClose) : fmtLong(state.msUntilOpen);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium transition hover:bg-white/5 ${tone}`}
        >
          {dot ? (
            <span className="relative flex h-1.5 w-1.5">
              {!endingSoon && (
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${dot}`} />
              )}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dot}`} />
            </span>
          ) : (
            <span className="text-[11px] leading-none">{meta.emoji}</span>
          )}
          <span className="whitespace-nowrap">{text}</span>
          {state.golden && state.live && (
            <span className="rounded-full bg-amber-400/20 px-1 text-[9px] font-bold text-amber-200">✨2×</span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-xs">
        <div className="font-semibold">{meta.emoji} {meta.label}</div>
        <div className="mt-1 space-y-0.5 text-muted-foreground">
          <div>Starts every {cfg.interval_min} minutes.</div>
          <div>Duration: {cfg.duration_min} minutes.</div>
          <div>Type <code className="rounded bg-white/10 px-1">{meta.command}</code> when live.</div>
          <div className="pt-1 font-medium text-foreground">
            {state.live ? `Ends in ${remaining}` : `Starts in ${remaining}`}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function HeaderBotEvents() {
  const { states, config } = useBotEvents();
  const kinds = (["fish", "dig", "wine"] as const).filter((k) => config[k].enabled);
  if (kinds.length === 0) return null;
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {kinds.map((k, i) => (
          <span key={k} className="inline-flex items-center">
            {i > 0 && <span className="mx-0.5 text-muted-foreground/50">·</span>}
            <EventBadge kind={k} state={states[k]} cfg={config[k]} />
          </span>
        ))}
      </div>
    </TooltipProvider>
  );
}
