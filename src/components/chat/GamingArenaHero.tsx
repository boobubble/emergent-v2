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
    <div className="arena-hero relative mx-2 mt-2 flex flex-col gap-1.5">
      {/* Hero banner */}
      <div className="arena-hero__banner relative overflow-hidden rounded-2xl border border-primary/30 shadow-[0_16px_48px_-20px_oklch(0.55_0.28_300/0.75)]">
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

        {/* Theme switcher + right-side members toggle — Gaming Arena hides the default ChatHeader, so replicate them here */}
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 sm:right-3 sm:top-2.5">
          <button
            type="button"
            className="chat-icon-btn"
            title="Chatroom themes"
            aria-label="Chatroom themes"
            onClick={() => window.dispatchEvent(new Event("palrgo:open-chat-theme-store"))}
          >
            <Palette className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-members-panel"))}
            className="chat-icon-btn relative"
            aria-label="Show members"
            title="Members"
          >
            <Users className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {online > 99 ? "99+" : online}
            </span>
          </button>
        </div>

        <div className="relative flex items-center gap-3 p-2.5 pr-20 sm:p-3 sm:pr-24">
          <div
            data-level-ring
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 text-primary-foreground shadow-lg sm:h-11 sm:w-11"
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-yellow-300" />
              <h1 className="truncate text-base font-black tracking-wide sm:text-xl">
                {label}
              </h1>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="truncate text-[11px] leading-tight text-muted-foreground sm:text-xs">
              {room?.topic || "Where gamers unite & dominate"}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-1.5 py-0.5 font-bold text-white shadow-[0_0_10px_-2px_oklch(0.65_0.25_25/0.9)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
              </span>
              <span className="rounded-full bg-background/60 px-1.5 py-0.5 font-semibold text-foreground backdrop-blur">
                {online.toLocaleString()} Online
              </span>
              <span className="rounded-full bg-background/60 px-1.5 py-0.5 font-mono text-muted-foreground backdrop-blur">
                ID: #{roomIdShort}
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
