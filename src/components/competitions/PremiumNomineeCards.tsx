import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Crown, Trophy, BadgeCheck, Pin, Sparkles, Users, MessageCircle,
  Globe, Twitter, Instagram, Youtube, Facebook, Linkedin, ExternalLink, Laugh,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { voteForCompetitor } from "@/lib/competitions.functions";
import type { Competitor } from "@/components/competitions/CompetitorGrid";
import { MomentumBadge, useCompetitorMomentum } from "@/components/competitions/BattleWidgets";

type RankStyle = { ring: string; badge: string; glow: string; label: string; icon: string };

const RANK_STYLES: Record<number, RankStyle> = {
  0: {
    ring: "from-amber-300 via-yellow-400 to-amber-500",
    badge: "bg-gradient-to-br from-amber-300 to-amber-500 text-black",
    glow: "shadow-[0_0_30px_-6px_rgba(251,191,36,0.65)]",
    label: "Gold",
    icon: "🥇",
  },
  1: {
    ring: "from-slate-200 via-zinc-300 to-slate-400",
    badge: "bg-gradient-to-br from-zinc-200 to-slate-400 text-black",
    glow: "shadow-[0_0_24px_-8px_rgba(226,232,240,0.55)]",
    label: "Silver",
    icon: "🥈",
  },
  2: {
    ring: "from-orange-400 via-amber-600 to-orange-700",
    badge: "bg-gradient-to-br from-orange-400 to-orange-600 text-black",
    glow: "shadow-[0_0_22px_-8px_rgba(251,146,60,0.55)]",
    label: "Bronze",
    icon: "🥉",
  },
};

function socialIcon(key: string) {
  const k = key.toLowerCase();
  if (k.includes("twitter") || k === "x") return Twitter;
  if (k.includes("insta")) return Instagram;
  if (k.includes("youtube") || k === "yt") return Youtube;
  if (k.includes("facebook") || k === "fb") return Facebook;
  if (k.includes("linkedin")) return Linkedin;
  return Globe;
}

function countryFlag(code?: string | null) {
  if (!code) return null;
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return code;
  const A = 0x1f1e6;
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65) + String.fromCodePoint(A + cc.charCodeAt(1) - 65);
}

export function PremiumNomineeCards({
  competitionId,
  competitionSlug,
  competitors,
  myVote,
  canVote,
  hideCounts,
  invalidateKey,
  memeCounts,
}: {
  competitionId: string;
  competitionSlug?: string;
  competitors: Competitor[];
  myVote: string | null;
  canVote: boolean;
  hideCounts?: boolean;
  invalidateKey: (string | number)[];
  memeCounts?: Record<string, number>;
}) {
  const vote = useServerFn(voteForCompetitor);
  const qc = useQueryClient();
  const momentum = useCompetitorMomentum(competitionId);

  const visible = competitors.filter((c) => !c.is_hidden);
  const sorted = [...visible].filter((c) => !c.is_disqualified).sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  const totalVotes = sorted.reduce((s, c) => s + (c.vote_count ?? 0), 0);
  const rankMap = new Map(sorted.map((c, i) => [c.id, i]));
  const leaderId = sorted[0]?.id;

  const voteM = useMutation({
    mutationFn: (id: string) => vote({ data: { competitionId, competitorId: id } }),
    onSuccess: () => {
      toast.success("🔥 Vote counted");
      qc.invalidateQueries({ queryKey: invalidateKey });
      qc.invalidateQueries({ queryKey: ["my-competitor-vote", competitionId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to vote"),
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((c) => {
        const mine = myVote === c.id;
        const disq = !!c.is_disqualified;
        const rank = rankMap.get(c.id);
        const rankStyle = rank !== undefined && rank < 3 ? RANK_STYLES[rank] : null;
        const isLeader = leaderId === c.id && (c.vote_count ?? 0) > 0 && !disq;
        const pct = totalVotes > 0 ? Math.round(((c.vote_count ?? 0) / totalVotes) * 100) : 0;
        const socials = c.social_links ?? {};
        const socialEntries = Object.entries(socials).filter(([, v]) => !!v).slice(0, 4) as [string, string][];
        const flag = countryFlag(c.country);
        const profileUrl = c.linked_profile?.username ? `/u/${c.linked_profile.username}` : null;

        return (
          <motion.div
            key={c.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className={`relative flex flex-col overflow-hidden rounded-2xl border backdrop-blur-xl ${
              disq
                ? "border-rose-500/30 bg-rose-500/5 opacity-70"
                : isLeader
                  ? `border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent ${rankStyle?.glow ?? ""}`
                  : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {/* Cover image */}
            {c.cover_image_url && (
              <div
                className="h-20 w-full bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(${c.cover_image_url})` }}
              />
            )}
            <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent to-black/60 ${c.cover_image_url ? "" : "hidden"}`} />

            {/* Rank badge */}
            {rankStyle && !hideCounts && (
              <div className={`absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-black ${rankStyle.badge}`}>
                <span>{rank! + 1}</span>
              </div>
            )}

            {/* Top-left flags */}
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1">
              {isLeader && !hideCounts && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-1.5 py-0.5 text-[9px] font-black text-black shadow">
                  <Trophy className="h-2.5 w-2.5" /> Leading
                </span>
              )}
              {c.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/30 px-1.5 py-0.5 text-[9px] font-bold text-fuchsia-100">
                  <Sparkles className="h-2.5 w-2.5" /> Featured
                </span>
              )}
              {c.is_pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/30 px-1.5 py-0.5 text-[9px] font-bold text-sky-100">
                  <Pin className="h-2.5 w-2.5" /> Pinned
                </span>
              )}
              {disq && <span className="rounded-full bg-rose-500/30 px-1.5 py-0.5 text-[9px] font-bold text-rose-100">Disqualified</span>}
            </div>

            <div className={`relative flex flex-col gap-2.5 p-3 ${c.cover_image_url ? "-mt-8" : "pt-10"} sm:p-4`}>
              {/* Avatar + identity */}
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-full bg-gradient-to-br p-[2px] ${rankStyle?.ring ?? (isLeader ? "from-amber-300 to-rose-500" : "from-fuchsia-500 to-violet-500")}`}>
                  <Avatar className="h-16 w-16 border-2 border-black">
                    <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} />
                    <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
                      {(c.name ?? "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-sm font-black text-white">{c.name}</span>
                    {c.linked_profile && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-400" />}
                    {flag && <span className="text-sm">{flag}</span>}
                  </div>
                  {c.linked_profile?.username && (
                    <div className="truncate text-[11px] text-white/60">@{c.linked_profile.username}</div>
                  )}
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-white/60">{c.description}</p>
                  )}
                </div>
              </div>

              {/* Vote count + progress */}
              {!hideCounts && (
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white/90">
                      {(c.vote_count ?? 0).toLocaleString()} <span className="text-white/50 font-normal">votes</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <MomentumBadge state={momentum[c.name]} />
                      <span className="font-bold text-white/80">{pct}%</span>
                    </div>
                  </div>
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className={`h-full ${
                        rank === 0
                          ? "bg-gradient-to-r from-amber-300 via-amber-400 to-rose-500"
                          : rank === 1
                            ? "bg-gradient-to-r from-slate-300 to-zinc-400"
                            : rank === 2
                              ? "bg-gradient-to-r from-orange-400 to-orange-600"
                              : "bg-gradient-to-r from-fuchsia-500 to-violet-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 18 }}
                    />
                  </div>
                </div>
              )}

              {competitionSlug && memeCounts && (memeCounts[c.id] ?? 0) > 0 && (
                <Link
                  to="/competitions/$slug/memes"
                  params={{ slug: competitionSlug }}
                  search={{ nominee: c.id } as any}
                  className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25"
                >
                  <Laugh className="h-3 w-3" /> 😂 Memes ({memeCounts[c.id]})
                </Link>
              )}


              {/* Social + profile */}
              {(socialEntries.length > 0 || profileUrl || c.website) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {socialEntries.map(([k, url]) => {
                    const Icon = socialIcon(k);
                    return (
                      <a
                        key={k}
                        href={url}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10"
                        aria-label={k}
                      >
                        <Icon className="h-3 w-3" />
                      </a>
                    );
                  })}
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer nofollow"
                      className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10"
                      aria-label="Website"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {profileUrl && (
                    <a
                      href={profileUrl}
                      className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/80 hover:bg-white/10"
                    >
                      <Users className="h-2.5 w-2.5" /> View
                    </a>
                  )}
                </div>
              )}

              {/* Vote button */}
              <Button
                size="sm"
                disabled={!canVote || voteM.isPending || disq}
                onClick={() => voteM.mutate(c.id)}
                className={`h-9 rounded-xl text-xs font-black transition ${
                  mine
                    ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/25"
                    : rank === 0
                      ? "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white hover:brightness-110"
                      : "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white hover:from-fuchsia-400 hover:to-rose-400"
                }`}
              >
                {mine ? "✓ Your Vote" : disq ? "Disqualified" : rank === 0 ? "👑 Vote for Leader" : "🗳 Vote"}
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
