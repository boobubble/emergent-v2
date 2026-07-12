import { useEffect, useMemo, useState } from "react";
import { Zap, Radio, Megaphone, MessageSquare, Trophy, Shield, Sparkles, Activity } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import heroBg from "@/assets/gaming-arena-hero.jpg";

/**
 * Gaming-Arena-only visual overlay: hero banner, announcement pill, and
 * stat strip. Mounts above the message list — never touches chat logic,
 * message rendering, or backend state. Purely presentational.
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

  // Top chatter: most messages today
  const topChatter = useMemo(() => {
    const counts = new Map<string, { name: string; n: number }>();
    for (const m of msgs) {
      if (m.kind === "system") continue;
      const name = state.users[m.authorId]?.name ?? "—";
      const prev = counts.get(m.authorId) ?? { name, n: 0 };
      counts.set(m.authorId, { name, n: prev.n + 1 });
    }
    let best: { name: string; n: number } | null = null;
    for (const v of counts.values()) if (!best || v.n > best.n) best = v;
    return best?.name ?? "—";
  }, [msgs, state.users]);


  const roomLevel = 1 + Math.floor(Math.log2(Math.max(2, messagesToday + online)));
  const activityScore = Math.round(online * 8 + messagesToday * 2);

  const [beat, setBeat] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setBeat((b) => b + 1), 1600);
    return () => window.clearInterval(t);
  }, []);

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

      {/* Announcement pill */}
      <div className="flex items-center gap-2 rounded-xl border border-primary/25 bg-card/60 px-3 py-2 backdrop-blur">
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/90 to-orange-500/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
          <Megaphone className="h-3 w-3" /> Announcement
        </span>
        <span className="truncate text-[12px] text-foreground/90">
          Welcome to {label}! Follow the rules and have fun.
        </span>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Messages Today" value={messagesToday.toLocaleString()} tint="cyan" />
        <StatCard icon={<Zap className="h-4 w-4" />} label="XP Boost" value="2.0x" hint="Active" tint="violet" pulse />
        <StatCard icon={<Trophy className="h-4 w-4" />} label="Top Chatter" value={topChatter} tint="pink" small />
        <StatCard icon={<Shield className="h-4 w-4" />} label="Room Level" value={`Lv. ${roomLevel}`} tint="amber" />
        <StatCard icon={<Activity className="h-4 w-4" />} label="Activity Score" value={activityScore.toLocaleString()} tint="lime" beat={beat} />
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

function StatCard({
  icon,
  label,
  value,
  hint,
  tint = "violet",
  small,
  pulse,
  beat: _beat,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tint?: "violet" | "cyan" | "pink" | "amber" | "lime";
  small?: boolean;
  pulse?: boolean;
  beat?: number;
}) {
  const tintMap: Record<string, string> = {
    violet: "from-fuchsia-500/25 to-violet-500/10 text-fuchsia-200",
    cyan: "from-cyan-500/25 to-sky-500/10 text-cyan-200",
    pink: "from-pink-500/25 to-rose-500/10 text-pink-200",
    amber: "from-amber-500/25 to-orange-500/10 text-amber-200",
    lime: "from-lime-400/25 to-emerald-500/10 text-lime-200",
  };
  return (
    <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-card/70 p-2.5 backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/50">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tintMap[tint]} opacity-70`} />
      <div className="relative flex items-center gap-2">
        <div className={`grid h-8 w-8 place-items-center rounded-lg bg-background/50 ring-1 ring-primary/25 ${pulse ? "animate-pulse" : ""}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={`truncate font-black text-foreground ${small ? "text-sm" : "text-base"}`}>
            {value}
            {hint && <span className="ml-1 text-[10px] font-semibold text-primary">{hint}</span>}
          </div>
        </div>
      </div>
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
