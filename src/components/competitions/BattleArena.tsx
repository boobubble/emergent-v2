import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft, Share2, Flag, Eye, Users, Vote as VoteIcon, Heart,
  Trophy, Crown, Sparkles, Zap, Radio, BadgeCheck, Flame, Gift,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "./Countdown";
import { AnimatedCounter } from "./AnimatedCounter";
import { CompetitionFollowButton } from "./CompetitionFollowButton";
import { flagFromCode } from "@/lib/country-flag";
import type { Competitor } from "./CompetitorGrid";
import { cn } from "@/lib/utils";

type Side = "left" | "right";

interface Props {
  competition: any;
  competitors: Competitor[];
  userId: string | null;
  hideCounts?: boolean;
  votingOpen: boolean;
  onVote: (competitorId: string) => void;
  myVote: string | null;
  onShare: () => void;
  onReport: () => void;
  isVoting?: boolean;
}

export function BattleArena({
  competition: c,
  competitors,
  userId,
  hideCounts,
  votingOpen,
  onVote,
  myVote,
  onShare,
  onReport,
  isVoting,
}: Props) {
  // Rank all eligible
  const eligible = competitors.filter((x) => !x.is_hidden && !x.is_disqualified);
  const sorted = useMemo(
    () => [...eligible].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)),
    [eligible],
  );

  // Featured pair — rotate through pairs if > 2
  const pairs = useMemo(() => {
    if (sorted.length < 2) return sorted.length === 1 ? [[sorted[0], null] as [Competitor, Competitor | null]] : [];
    const list: [Competitor, Competitor][] = [];
    // Always show top vs #2 first
    list.push([sorted[0], sorted[1]]);
    // Then dark-horse pairs
    for (let i = 2; i < sorted.length - 1; i += 2) {
      list.push([sorted[i], sorted[i + 1]]);
    }
    return list;
  }, [sorted]);

  const [pairIdx, setPairIdx] = useState(0);
  useEffect(() => {
    if (pairs.length <= 1) return;
    const id = setInterval(() => setPairIdx((i) => (i + 1) % pairs.length), 7000);
    return () => clearInterval(id);
  }, [pairs.length]);

  const pair = pairs[pairIdx] ?? null;
  const left = pair?.[0] ?? null;
  const right = pair?.[1] ?? null;

  const lv = left?.vote_count ?? 0;
  const rv = right?.vote_count ?? 0;
  const total = Math.max(1, lv + rv);
  const lPct = Math.round((lv / total) * 100);
  const rPct = 100 - lPct;

  const isLive = c.status === "live";
  const isUpcoming = c.status === "upcoming";
  const isCompleted = c.status === "completed";

  const rewards = (c.rewards ?? {}) as any;
  const prizeParts = [
    rewards.coins ? `${rewards.coins.toLocaleString()} coins` : null,
    rewards.xp ? `${rewards.xp} XP` : null,
    rewards.premium_days ? `${rewards.premium_days}d premium` : null,
    rewards.badge || null,
  ].filter(Boolean) as string[];

  return (
    <div className="relative overflow-hidden rounded-b-[2.5rem]">
      {/* Arena background */}
      <ArenaBackdrop bannerUrl={c.banner_url} />

      {/* Top bar */}
      <div className="relative z-20 flex items-start justify-between gap-2 px-4 pt-4">
        <Link to="/competitions">
          <Button size="icon" variant="secondary" className="rounded-full border border-white/10 bg-black/40 backdrop-blur">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-wrap justify-end gap-2">
          <CompetitionFollowButton competitionId={c.id} userId={userId} />
          <Button size="sm" variant="secondary" onClick={onShare} className="rounded-full border border-white/10 bg-black/40 backdrop-blur">
            <Share2 className="mr-1 h-4 w-4" /> Share
          </Button>
          <Button size="sm" variant="secondary" onClick={onReport} className="rounded-full border border-white/10 bg-black/40 backdrop-blur">
            <Flag className="mr-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title + live badge + countdown */}
      <div className="relative z-20 px-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/60 bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-200 shadow-[0_0_20px_-4px_rgba(244,63,94,0.6)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
              Live Battle
            </span>
          )}
          {isUpcoming && (
            <Badge className="border-sky-400/50 bg-sky-500/20 text-sky-200">Upcoming</Badge>
          )}
          {isCompleted && (
            <Badge className="border-zinc-400/40 bg-zinc-500/20 text-zinc-200">Concluded</Badge>
          )}
          {c.category?.name && (
            <Badge variant="outline" className="border-white/20 bg-white/5 backdrop-blur">
              {c.category.name}
            </Badge>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] sm:text-4xl">
          {c.name}
        </h1>
        {!isCompleted && (
          <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
            <Zap className="h-3.5 w-3.5 text-amber-300" />
            <span>{isLive ? "Ends in" : "Starts in"}</span>
            <Countdown endAt={isLive ? c.end_at : c.start_at} compact />
          </div>
        )}
      </div>

      {/* VS Battle */}
      <div className="relative z-20 mt-4 px-4">
        {pair ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${left?.id}-${right?.id ?? "solo"}-${pairIdx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4"
            >
              <FighterCard side="left" c={left!} isLeading={lv >= rv && lv > 0} hideCounts={hideCounts} />
              <VSBadge live={isLive} />
              {right ? (
                <FighterCard side="right" c={right} isLeading={rv > lv} hideCounts={hideCounts} />
              ) : (
                <div className="grid h-full min-h-[180px] place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center text-xs text-white/50">
                  Awaiting<br />challenger
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="grid place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center">
            <Trophy className="mb-3 h-10 w-10 text-amber-300" />
            <div className="text-sm text-white/80">Nominees will step into the arena soon.</div>
          </div>
        )}

        {/* Bridge progress bar */}
        {pair && right && !hideCounts && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold tabular-nums">
              <span className="text-sky-300"><AnimatedCounter value={lv} /> · {lPct}%</span>
              <span className="text-white/50">Total <AnimatedCounter value={lv + rv} /></span>
              <span className="text-rose-300">{rPct}% · <AnimatedCounter value={rv} /></span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-black/50 shadow-inner">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                initial={false}
                animate={{ width: `${lPct}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
              <motion.div
                className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-rose-500 via-pink-500 to-fuchsia-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                initial={false}
                animate={{ width: `${rPct}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
              {/* Center clash */}
              <motion.div
                aria-hidden
                className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 to-rose-500 shadow-[0_0_20px_rgba(251,191,36,0.9)]"
                animate={{ left: `${lPct}%`, scale: [1, 1.15, 1] }}
                transition={{ left: { type: "spring", stiffness: 80, damping: 20 }, scale: { duration: 1.2, repeat: Infinity } }}
              />
            </div>
          </div>
        )}

        {/* Vote CTAs for featured pair */}
        {pair && right && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <VoteButton
              side="left"
              label={left!.name}
              mine={myVote === left!.id}
              disabled={!votingOpen || !userId || isVoting}
              onClick={() => onVote(left!.id)}
            />
            <VoteButton
              side="right"
              label={right.name}
              mine={myVote === right.id}
              disabled={!votingOpen || !userId || isVoting}
              onClick={() => onVote(right.id)}
            />
          </div>
        )}

        {/* Pair pager dots */}
        {pairs.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {pairs.map((_, i) => (
              <button
                key={i}
                onClick={() => setPairIdx(i)}
                aria-label={`Show battle ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === pairIdx ? "w-6 bg-amber-300" : "w-1.5 bg-white/25 hover:bg-white/50",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="relative z-20 mt-5 grid grid-cols-2 gap-2 px-4 sm:grid-cols-4">
        <StatChip icon={<Users className="h-3.5 w-3.5" />} label="Watching" value={(c.total_participants ?? 0) + Math.max(1, Math.floor((c.views_count ?? 0) / 25))} />
        {!hideCounts && <StatChip icon={<VoteIcon className="h-3.5 w-3.5" />} label="Votes" value={c.total_votes ?? 0} accent />}
        <StatChip icon={<Eye className="h-3.5 w-3.5" />} label="Views" value={c.views_count ?? 0} />
        <StatChip icon={<Heart className="h-3.5 w-3.5" />} label="Reactions" value={eligible.reduce((s, x) => s + (x.vote_count ?? 0), 0)} />
      </div>

      {/* Prize banner */}
      {prizeParts.length > 0 && (
        <div className="relative z-20 mx-4 mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-amber-400/5 to-transparent px-3 py-2.5 text-sm backdrop-blur">
          <Gift className="h-4 w-4 text-amber-300" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">Prize Pool</span>
          <span className="text-amber-100/90">{prizeParts.join(" · ")}</span>
        </div>
      )}

      {/* Live ticker */}
      <div className="relative z-20 mx-4 mt-4 mb-6">
        <LiveTicker competitors={sorted.slice(0, 5)} />
      </div>
    </div>
  );
}

/* ------------------------------- Subcomponents ------------------------------ */

function ArenaBackdrop({ bannerUrl }: { bannerUrl?: string | null }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#0b0716_45%,_#050308_100%)]" />
      {/* Banner blend */}
      {bannerUrl && (
        <div
          className="absolute inset-0 opacity-25 mix-blend-luminosity"
          style={{ background: `url(${bannerUrl}) center/cover` }}
        />
      )}
      {/* Stadium spotlights */}
      <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-sky-500/40 blur-3xl" />
      <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-rose-500/40 blur-3xl" />
      <div className="absolute left-1/2 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />
      {/* Grid floor */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
      <div
        className="absolute inset-x-0 bottom-0 h-32 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(transparent 95%, rgba(255,255,255,0.25) 96%), linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.25) 96%)",
          backgroundSize: "40px 40px",
          transform: "perspective(400px) rotateX(60deg)",
          transformOrigin: "bottom",
        }}
      />
      {/* Particles */}
      <Particles />
    </div>
  );
}

function Particles() {
  const dots = useMemo(
    () => Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 60,
      delay: Math.random() * 4,
      dur: 4 + Math.random() * 5,
      size: 2 + Math.random() * 3,
    })),
    [],
  );
  return (
    <>
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.9)]"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

function VSBadge({ live }: { live?: boolean }) {
  return (
    <div className="relative grid place-items-center">
      <motion.div
        className="absolute h-20 w-20 rounded-full bg-gradient-to-br from-amber-400/40 via-rose-500/40 to-fuchsia-500/40 blur-xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="relative grid h-14 w-14 place-items-center rounded-full border-2 border-white/30 bg-black/60 backdrop-blur">
        <span className="bg-gradient-to-br from-amber-200 via-white to-rose-200 bg-clip-text text-lg font-black text-transparent">
          VS
        </span>
      </div>
      {live && (
        <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/80">
          <Radio className="h-2.5 w-2.5 text-rose-400" /> Round 1
        </div>
      )}
    </div>
  );
}

function FighterCard({
  c, side, isLeading, hideCounts,
}: {
  c: Competitor;
  side: Side;
  isLeading?: boolean;
  hideCounts?: boolean;
}) {
  const isLeft = side === "left";
  const accent = isLeft ? "from-sky-500 via-blue-500 to-cyan-400" : "from-rose-500 via-pink-500 to-fuchsia-400";
  const ring = isLeft ? "ring-sky-400/80 shadow-[0_0_40px_-8px_rgba(56,189,248,0.7)]" : "ring-rose-400/80 shadow-[0_0_40px_-8px_rgba(244,63,94,0.7)]";
  const glowText = isLeft ? "text-sky-300" : "text-rose-300";
  const flag = flagFromCode(c.country);
  const username = c.linked_profile?.username;

  return (
    <div className={cn("relative flex flex-col items-center gap-2", isLeft ? "text-left" : "text-right")}>
      {isLeading && !hideCounts && (
        <motion.div
          className="absolute -top-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.5 text-[10px] font-black text-black shadow-[0_0_20px_rgba(251,191,36,0.7)]"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <Crown className="h-3 w-3" /> LEADING
        </motion.div>
      )}
      <div className="relative">
        <motion.div
          className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-70 blur-xl", accent)}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        <Avatar className={cn("relative h-24 w-24 rounded-full ring-4 sm:h-28 sm:w-28", ring)}>
          <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} loading="lazy" />
          <AvatarFallback
            className="bg-gradient-to-br from-slate-700 to-slate-900 text-2xl font-black text-white"
            style={{ background: c.linked_profile?.avatar_color ?? undefined }}
          >
            {c.name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {flag && (
          <span className="absolute -bottom-1 -right-1 grid h-7 min-w-7 place-items-center rounded-full border border-white/30 bg-black/80 px-1 text-base leading-none shadow-lg">
            {flag}
          </span>
        )}
      </div>
      <div className={cn("flex items-center gap-1", isLeft ? "" : "flex-row-reverse")}>
        <h3 className="max-w-[9rem] truncate text-sm font-black text-white sm:text-base">{c.name}</h3>
        {username && <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400" />}
      </div>
      {username && (
        <a href={`/u/${username}`} className={cn("truncate text-[11px] hover:underline", glowText)}>
          @{username}
        </a>
      )}
      {!hideCounts && (
        <div className={cn("inline-flex items-center gap-1 text-[11px] font-bold", glowText)}>
          <Flame className="h-3 w-3" />
          <AnimatedCounter value={c.vote_count ?? 0} /> votes
        </div>
      )}
    </div>
  );
}

function VoteButton({
  side, label, mine, disabled, onClick,
}: {
  side: Side;
  label: string;
  mine: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const isLeft = side === "left";
  const bg = mine
    ? "bg-emerald-500 hover:bg-emerald-500/90 text-white"
    : isLeft
      ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white"
      : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative overflow-hidden rounded-2xl px-3 py-3 text-sm font-black shadow-xl transition-transform active:scale-[0.97] disabled:opacity-50",
        bg,
      )}
      aria-label={mine ? `You voted for ${label}` : `Vote for ${label}`}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.35),_transparent_60%)]" />
      <span className="relative inline-flex items-center justify-center gap-1.5">
        {mine ? <><Sparkles className="h-4 w-4" /> Voted</> : <><VoteIcon className="h-4 w-4" /> Vote {label.split(" ")[0]}</>}
      </span>
    </button>
  );
}

function StatChip({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 backdrop-blur",
      accent
        ? "border-amber-400/40 bg-amber-400/10"
        : "border-white/10 bg-white/[0.04]",
    )}>
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
        {icon}{label}
      </span>
      <span className={cn("text-sm font-black tabular-nums", accent ? "text-amber-200" : "text-white")}>
        <AnimatedCounter value={value} />
      </span>
    </div>
  );
}

function LiveTicker({ competitors }: { competitors: Competitor[] }) {
  const items = useMemo(() => {
    if (competitors.length === 0) return [] as { icon: string; text: string }[];
    const templates = [
      (n: string) => ({ icon: "🔥", text: `${n} just picked up new votes` }),
      (n: string) => ({ icon: "❤️", text: `Fans are hyping ${n}` }),
      (n: string) => ({ icon: "🎁", text: `A supporter boosted ${n}` }),
      (n: string) => ({ icon: "👏", text: `Crowd cheering for ${n}` }),
      (n: string) => ({ icon: "⚡", text: `${n} climbing the leaderboard` }),
    ];
    const out: { icon: string; text: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const c = competitors[i % competitors.length];
      const t = templates[i % templates.length];
      out.push(t(c.name));
    }
    return out;
  }, [competitors]);

  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black/70 to-transparent" />
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-300">
        <Radio className="h-3 w-3 animate-pulse" /> Live Activity
      </div>
      <div className="relative overflow-hidden py-2">
        <motion.div
          className="flex gap-6 whitespace-nowrap px-4 text-xs text-white/80"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((it, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span>{it.icon}</span>
              <span>{it.text}</span>
              <span className="text-white/30">•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
