import { useMemo } from "react";
import { Zap, Radio, Shield, Sparkles, Palette, Users } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import heroBg from "@/assets/gaming-arena-hero.jpg";

/**
 * Gaming-Arena-only visual overlay: hero banner and live event ticker.
 * Mounts above the message list — never touches chat logic, message
 * rendering, or backend state. Purely presentational.
 *
 * Note: online count is derived from room membership so we don't open a
 * second presence subscription to the same realtime channel the Sidebar
 * already owns (Supabase realtime rejects `.on('presence', ...)` after
 * the shared channel is subscribed).
 */
export function GamingArenaHero({ channelId }: { channelId: string }) {
  const { state, channelLabel, channelMessages } = useChat();
  const room = state.rooms[channelId];
  const online = Math.max(1, room?.members?.length ?? 1);

  const label = channelLabel(channelId);
  const msgs = channelMessages(channelId);

  // Messages today (client-side count)
  const messagesToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return msgs.filter((m) => m.ts >= start.getTime() && m.kind !== "system").length;
  }, [msgs]);

  const roomIdShort = (channelId || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "GA245";

  return (
    <div className="arena-hero relative mx-3 mt-3 flex flex-col gap-3">
      {/* Hero banner */}
      <div className="arena-hero__banner relative overflow-hidden rounded-2xl border border-primary/30 shadow-[0_20px_60px_-24px_oklch(0.55_0.28_300/0.75)]">
        <img
          src={heroBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          width={1600}
          height={640}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/45 to-background/10" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_10%_20%,oklch(0.55_0.28_300/0.35),transparent_60%)]" />

        <div className="relative flex items-center gap-4 p-4 sm:p-5">
          <div
            data-level-ring
            className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 text-primary-foreground shadow-lg"
          >
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-300" />
              <h1 className="truncate text-lg font-black tracking-wide sm:text-2xl">
                {label}
              </h1>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
              {room?.topic || "Where gamers unite & dominate"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 font-bold text-white shadow-[0_0_12px_-2px_oklch(0.65_0.25_25/0.9)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
              </span>
              <span className="rounded-full bg-background/60 px-2 py-0.5 font-semibold text-foreground backdrop-blur">
                {online.toLocaleString()} Online
              </span>
              <span className="rounded-full bg-background/60 px-2 py-0.5 font-mono text-muted-foreground backdrop-blur">
                Room ID: #{roomIdShort}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky event chips */}
        <div className="arena-ticker relative -mx-px overflow-hidden">
          <div className="arena-ticker__track text-[11px] font-semibold">
            {[
              { icon: "🎁", t: "Lucky Drop in 03:12" },
              { icon: "🔥", t: "Double XP Active" },
              { icon: "🏆", t: "Weekly Competition Live" },
              { icon: "🎙", t: "Live Radio: Neon Nights" },
              { icon: "⚡", t: "Server Boost x2" },
              { icon: "🎁", t: "Lucky Drop in 03:12" },
              { icon: "🔥", t: "Double XP Active" },
              { icon: "🏆", t: "Weekly Competition Live" },
              { icon: "🎙", t: "Live Radio: Neon Nights" },
              { icon: "⚡", t: "Server Boost x2" },
            ].map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-foreground/90">
                <span>{c.icon}</span>
                <span>{c.t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Radio strip — subtle */}
      <div className="sr-only" aria-live="polite">
        Gaming Arena • {online} online • {messagesToday} messages today
      </div>
      {/* keep Radio icon warning silenced */}
      <Radio className="hidden" />
    </div>
  );
}

/** Bottom activity ticker — Gaming Arena only. */
export function GamingArenaLiveFeed({ channelId }: { channelId: string }) {
  const { channelMessages, state } = useChat();
  const msgs = channelMessages(channelId);
  const items = useMemo(() => {
    const recent = msgs.slice(-8).reverse();
    if (recent.length === 0) {
      return [
        { icon: "🔥", t: "Arjun sent x10" },
        { icon: "💜", t: "Riya reached Level 27" },
        { icon: "❤️", t: "Kabir sent x5" },
        { icon: "🎙", t: "Dev joined the room" },
        { icon: "🎁", t: "Anjali sent gift x1" },
      ];
    }
    return recent.map((m) => ({
      icon: m.kind === "system" ? "⚡" : "💬",
      t: `${state.users[m.authorId]?.name || "someone"}: ${(m.text || "").slice(0, 40)}`,
    }));
  }, [msgs, state.users]);


  return (
    <div className="arena-livefeed sticky bottom-0 z-10 flex items-center gap-2 border-t border-primary/25 bg-card/70 px-3 py-1.5 text-[11px] backdrop-blur-md">
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 font-black uppercase tracking-wider text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live Feed
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="arena-ticker__track flex gap-6 whitespace-nowrap">
          {[...items, ...items].map((i, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 text-foreground/85">
              <span>{i.icon}</span>
              <span className="truncate">{i.t}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
