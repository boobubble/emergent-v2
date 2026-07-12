import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Crown, Medal, Trophy, Pin, Star, BadgeCheck, Globe,
  Instagram, Twitter, Youtube, Music2, Pencil, Trash2, EyeOff, Eye,
  Ban, Undo2, RotateCcw, Share2, Vote,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "./AnimatedCounter";
import {
  adminDeleteCompetitor,
  voteForCompetitor,
  adminSetCompetitorFlags,
  adminResetCompetitorVotes,
} from "@/lib/competitions.functions";
import { flagFromCode } from "@/lib/country-flag";
import type { Competitor } from "./CompetitorGrid";
import { cn } from "@/lib/utils";

const RANK_STYLES: Record<number, { ring: string; glow: string; badgeBg: string; label: string; icon: ReactNode }> = {
  1: {
    ring: "ring-2 ring-amber-400/70",
    glow: "shadow-[0_0_40px_-8px_rgba(251,191,36,0.55)] border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent",
    badgeBg: "bg-gradient-to-r from-amber-400 to-yellow-500 text-black",
    label: "1st",
    icon: <Crown className="h-3.5 w-3.5" />,
  },
  2: {
    ring: "ring-2 ring-zinc-300/60",
    glow: "shadow-[0_0_30px_-10px_rgba(212,212,216,0.5)] border-zinc-300/40 bg-gradient-to-br from-zinc-300/10 via-zinc-200/5 to-transparent",
    badgeBg: "bg-gradient-to-r from-zinc-300 to-zinc-100 text-black",
    label: "2nd",
    icon: <Medal className="h-3.5 w-3.5" />,
  },
  3: {
    ring: "ring-2 ring-orange-400/60",
    glow: "shadow-[0_0_30px_-10px_rgba(251,146,60,0.45)] border-orange-400/40 bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-transparent",
    badgeBg: "bg-gradient-to-r from-orange-400 to-amber-600 text-black",
    label: "3rd",
    icon: <Medal className="h-3.5 w-3.5" />,
  },
};

function SocialIcons({ links }: { links?: Record<string, string | null | undefined> | null }) {
  if (!links) return null;
  const items: { key: string; url?: string | null; icon: ReactNode; label: string }[] = [
    { key: "instagram", url: links.instagram, icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
    { key: "twitter", url: links.twitter, icon: <Twitter className="h-4 w-4" />, label: "Twitter/X" },
    { key: "tiktok", url: links.tiktok, icon: <Music2 className="h-4 w-4" />, label: "TikTok" },
    { key: "youtube", url: links.youtube, icon: <Youtube className="h-4 w-4" />, label: "YouTube" },
  ];
  const visible = items.filter((i) => i.url);
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((i) => (
        <a
          key={i.key}
          href={i.url!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={i.label}
          className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-muted-foreground transition hover:scale-110 hover:border-white/30 hover:text-foreground"
        >
          {i.icon}
        </a>
      ))}
    </div>
  );
}

export function PremiumCompetitorGrid({
  competitionId,
  competitors,
  myVote,
  canVote,
  hideCounts,
  isAdmin,
  votingClosed,
  votingUpcoming,
  onEdit,
  invalidateKey,
}: {
  competitionId: string;
  competitors: Competitor[];
  myVote: string | null;
  canVote: boolean;
  hideCounts?: boolean;
  isAdmin?: boolean;
  votingClosed?: boolean;
  votingUpcoming?: boolean;
  onEdit?: (c: Competitor) => void;
  invalidateKey: (string | number)[];
}) {
  const vote = useServerFn(voteForCompetitor);
  const del = useServerFn(adminDeleteCompetitor);
  const setFlags = useServerFn(adminSetCompetitorFlags);
  const resetVotes = useServerFn(adminResetCompetitorVotes);
  const qc = useQueryClient();

  const visible = isAdmin ? competitors : competitors.filter((c) => !c.is_hidden);
  const eligible = visible.filter((c) => !c.is_disqualified);
  const totalVotes = eligible.reduce((s, c) => s + (c.vote_count ?? 0), 0);
  const rankMap = new Map<string, number>();
  [...eligible].sort((a, b) => b.vote_count - a.vote_count).forEach((c, i) => rankMap.set(c.id, i + 1));

  // Pinned first, then original sort_order
  const ordered = [...visible].sort((a, b) => {
    if (!!b.is_pinned !== !!a.is_pinned) return b.is_pinned ? 1 : -1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const voteM = useMutation({
    mutationFn: (competitorId: string) => vote({ data: { competitionId, competitorId } }),
    onSuccess: () => {
      toast.success("🗳 Vote counted");
      qc.invalidateQueries({ queryKey: invalidateKey });
      qc.invalidateQueries({ queryKey: ["my-competitor-vote", competitionId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to vote"),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: invalidateKey }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const flagsM = useMutation({
    mutationFn: (v: { id: string; is_hidden?: boolean; is_disqualified?: boolean }) => setFlags({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: invalidateKey }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const resetM = useMutation({
    mutationFn: (competitorId: string) => resetVotes({ data: { competitorId } }),
    onSuccess: () => { toast.success("Votes reset"); qc.invalidateQueries({ queryKey: invalidateKey }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (visible.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/10 text-amber-300">
          <Trophy className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold">No nominees have been added yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Check back soon — nominees will appear here.</p>
      </div>
    );
  }

  const shareNominee = async (c: Competitor) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Vote for ${c.name}`;
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: c.name, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch { /* cancelled */ }
  };

  const voteCta = votingClosed ? "🏁 Voting Closed" : votingUpcoming ? "Voting Soon" : "Vote Now";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((c) => {
        const mine = myVote === c.id;
        const disq = !!c.is_disqualified;
        const rank = rankMap.get(c.id);
        const isTop3 = !hideCounts && !disq && rank !== undefined && rank <= 3 && c.vote_count > 0;
        const style = isTop3 && rank ? RANK_STYLES[rank] : null;
        const pct = totalVotes > 0 ? Math.round((c.vote_count / totalVotes) * 100) : 0;
        const flag = flagFromCode(c.country);
        const linkedUsername = c.linked_profile?.username;
        const hasSocials = !!c.social_links && Object.values(c.social_links).some(Boolean);

        return (
          <article
            key={c.id}
            className={cn(
              "group relative flex flex-col gap-3 rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5",
              style
                ? style.glow
                : disq
                  ? "border-rose-500/25 bg-rose-500/5 opacity-70"
                  : c.is_hidden
                    ? "border-white/10 bg-white/[0.03] opacity-60"
                    : "border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:border-white/20 hover:shadow-xl",
            )}
            aria-label={`Nominee ${c.name}`}
          >
            {/* Top-right rank badge */}
            {style && (
              <div className={cn("absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-lg", style.badgeBg)}>
                {style.icon}
                <span>{style.label}</span>
              </div>
            )}

            {/* Top-left status badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-1">
              {c.is_pinned && (
                <Badge className="gap-1 border border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-100 text-[10px]">
                  <Pin className="h-3 w-3" /> Pinned
                </Badge>
              )}
              {c.is_featured && (
                <Badge className="gap-1 border border-amber-400/40 bg-amber-500/15 text-amber-200 text-[10px]">
                  <Star className="h-3 w-3" /> Featured
                </Badge>
              )}
              {c.is_hidden && <Badge variant="outline" className="text-[10px]">Hidden</Badge>}
              {disq && <Badge variant="destructive" className="text-[10px]">Disqualified</Badge>}
            </div>

            {/* Header */}
            <div className="flex items-start gap-4 pt-6">
              <div className="relative">
                <Avatar className={cn("h-20 w-20 shrink-0 rounded-full", style?.ring ?? "ring-2 ring-white/10")}>
                  <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} loading="lazy" />
                  <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
                    {c.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {flag && (
                  <span
                    className="absolute -bottom-1 -right-1 grid h-7 min-w-7 place-items-center rounded-full border border-white/20 bg-background/90 px-1 text-base leading-none shadow"
                    title={c.country ?? undefined}
                    aria-label={`Country ${c.country}`}
                  >
                    {flag}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-base font-bold">{c.name}</h3>
                  {linkedUsername && (
                    <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400" aria-label="Verified" />
                  )}
                </div>
                {linkedUsername && (
                  <a
                    href={`/u/${linkedUsername}`}
                    className="block truncate text-xs text-sky-300 hover:underline"
                  >
                    @{linkedUsername}
                  </a>
                )}
                {c.country && (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{c.country}</div>
                )}
                {c.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                )}
              </div>
            </div>

            {/* Socials + website */}
            {(hasSocials || c.website) && (
              <div className="flex flex-wrap items-center gap-1.5">
                <SocialIcons links={c.social_links ?? null} />
                {c.website && (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Website"
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-muted-foreground transition hover:scale-110 hover:border-white/30 hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {/* Vote progress */}
            {!hideCounts && (
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold tabular-nums">
                    {c.vote_count.toLocaleString()} <span className="font-normal text-muted-foreground">votes</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-700 ease-out",
                      style && rank === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                      : style && rank === 2 ? "bg-gradient-to-r from-zinc-200 to-zinc-400"
                      : style && rank === 3 ? "bg-gradient-to-r from-orange-400 to-amber-600"
                      : "bg-gradient-to-r from-primary to-fuchsia-500",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div
                  className={cn(
                    "mt-1.5 inline-flex h-4 items-center gap-1 text-[11px] font-semibold transition-opacity duration-300",
                    rank === 1 && c.vote_count > 0 ? "text-amber-300 opacity-100" : "opacity-0",
                  )}
                  aria-live="polite"
                >
                  <Trophy className="h-3 w-3 animate-pulse" /> Currently Leading
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className={cn(
                  "flex-1 font-semibold",
                  mine && "bg-emerald-600 hover:bg-emerald-600/90",
                )}
                variant={mine ? "default" : "default"}
                disabled={!canVote || voteM.isPending || disq}
                onClick={() => voteM.mutate(c.id)}
                aria-label={mine ? "You voted for this nominee" : `Vote for ${c.name}`}
              >
                <Vote className="mr-1.5 h-4 w-4" />
                {mine ? "Your Vote ✓" : voteCta}
              </Button>
              {linkedUsername && (
                <Button asChild size="icon" variant="ghost" aria-label="View profile" title="View profile">
                  <a href={`/u/${linkedUsername}`}><BadgeCheck className="h-4 w-4" /></a>
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => shareNominee(c)}
                aria-label="Share nominee"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Admin row */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-1 border-t border-white/10 pt-2">
                <Button size="icon" variant="ghost" onClick={() => onEdit?.(c)} aria-label="Edit" title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => flagsM.mutate({ id: c.id, is_hidden: !c.is_hidden })}
                  title={c.is_hidden ? "Unhide" : "Hide"}
                  aria-label={c.is_hidden ? "Unhide" : "Hide"}
                >
                  {c.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => flagsM.mutate({ id: c.id, is_disqualified: !c.is_disqualified })}
                  title={disq ? "Restore" : "Disqualify"}
                  aria-label={disq ? "Restore" : "Disqualify"}
                >
                  {disq ? <Undo2 className="h-4 w-4" /> : <Ban className="h-4 w-4 text-rose-400" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => confirm(`Reset votes for ${c.name}?`) && resetM.mutate(c.id)}
                  title="Reset votes"
                  aria-label="Reset votes"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => confirm(`Remove ${c.name}?`) && delM.mutate(c.id)}
                  title="Delete"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-rose-400" />
                </Button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
