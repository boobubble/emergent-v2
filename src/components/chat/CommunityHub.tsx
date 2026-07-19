import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Bot, Target, Trophy, Gift, Swords, Gamepad2, Radio, Flame,
  ArrowRight, Sparkles, Loader2, Clock, Coins, Star, X, PenLine,
} from "lucide-react";
import { useMehfilLabel } from "@/lib/use-mehfil-label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { getTodayMissions } from "@/lib/missions.functions";
import { listCompetitions } from "@/lib/competitions.functions";

type MissionRow = { id: string; title: string; target: number; progress: number; completed: boolean; claimed: boolean; xp: number; coins: number };
type CompRow = { id: string; name: string; status: string; end_at: string | null; banner_url?: string | null };
type RadioRow = { host_name?: string | null; now_playing?: string | null; is_live?: boolean | null; next_host?: string | null };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
}

function useHubData(open: boolean) {
  const { user } = useAuth();
  const fetchMissions = useServerFn(getTodayMissions);
  const fetchComps = useServerFn(listCompetitions);
  const [loading, setLoading] = useState(false);
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [comps, setComps] = useState<CompRow[]>([]);
  const [coins, setCoins] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [radio, setRadio] = useState<RadioRow | null>(null);
  const [trending, setTrending] = useState<{ id: string; slug: string | null; text: string | null; reaction_count: number } | null>(null);

  useEffect(() => {
    if (!open || !user?.id) return;
    let alive = true;
    setLoading(true);
    (async () => {
      const [ms, cs, prof, rad, trend] = await Promise.all([
        fetchMissions({}).catch(() => ({ missions: [] as MissionRow[] })),
        fetchComps({}).catch(() => [] as CompRow[]),
        supabase.from("profiles").select("coins,xp,level").eq("id", user.id).maybeSingle(),
        supabase.from("radio_widget_state").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("posts").select("id,slug,text,reaction_count").order("reaction_count", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (!alive) return;
      setMissions((ms.missions ?? []) as MissionRow[]);
      const now = Date.now();
      setComps(((cs as CompRow[]) ?? []).filter((c) => c.status === "live" && (!c.end_at || new Date(c.end_at).getTime() > now)).slice(0, 3));
      setCoins(prof.data?.coins ?? 0);
      setXp(prof.data?.xp ?? 0);
      setLevel(prof.data?.level ?? 1);
      setRadio((rad.data as RadioRow | null) ?? null);
      setTrending((trend.data as typeof trending) ?? null);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [open, user?.id, fetchMissions, fetchComps]);

  return { loading, missions, comps, coins, xp, level, radio, trending };
}

function fmtTimeLeft(iso: string | null): string {
  if (!iso) return "Ongoing";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Ending soon";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d}d ${h % 24}h`;
  if (h >= 1) return `${h}h ${m % 60}m`;
  return `${Math.max(1, m)}m`;
}

const GAMES = [
  { key: "arrow", label: "Arrow Puzzle", to: "/games" },
  { key: "memory", label: "Memory Game", to: "/games" },
  { key: "ludo", label: "Ludo", to: "/games" },
];

export function CommunityHub({ open, onOpenChange, isMobile }: Props) {
  const data = useHubData(open);
  const mehfilLabel = useMehfilLabel();
  const claimable = useMemo(
    () => data.missions.filter((m) => m.completed && !m.claimed).length,
    [data.missions],
  );
  const activeMission = data.missions.find((m) => !m.claimed) ?? data.missions[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`hub-glass overflow-y-auto border-white/10 p-0 ${
          isMobile
            ? "h-[85vh] rounded-t-3xl"
            : "w-full sm:max-w-md"
        }`}
      >
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

        <SheetHeader className="sticky top-0 z-10 border-b border-white/10 bg-background/70 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SheetTitle className="flex items-center gap-2 text-left">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  Community Hub
                </span>
              </SheetTitle>
              <p className="text-left text-xs text-muted-foreground">
                One place for missions, rewards, competitions and more.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close Community Hub"
              title="Close"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="relative space-y-3 p-4 pb-8">
          {data.loading && (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading your community…
            </div>
          )}

          {/* Boobubble Assistant */}
          <HubCard icon={<Bot className="h-4 w-4" />} title="AI Assistant" tone="from-violet-500/25 via-fuchsia-500/10">
            <p className="text-xs text-muted-foreground">Ask AI, get community help, quick tips.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to="/feed" className="hub-chip"><Sparkles className="h-3 w-3" /> Ask AI</Link>
              <Link to="/feed" className="hub-chip">Quick Tips</Link>
              <Link to="/feed" className="hub-chip">Community Help</Link>
            </div>
          </HubCard>

          {/* Daily Mission */}
          <HubCard icon={<Target className="h-4 w-4" />} title="Daily Mission" tone="from-emerald-500/25 via-teal-500/10">
            {activeMission ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate font-semibold text-foreground">{activeMission.title}</span>
                  <span className="shrink-0 text-muted-foreground">+{activeMission.coins}<Coins className="mx-0.5 inline h-3 w-3" /> · +{activeMission.xp}XP</span>
                </div>
                <Progress value={(activeMission.progress / Math.max(1, activeMission.target)) * 100} className="mt-2 h-1.5" />
                <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{activeMission.progress}/{activeMission.target}</span>
                  <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> Resets 00:00 UTC</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No missions right now.</p>
            )}
            <HubButton to="/achievements">Continue Mission</HubButton>
          </HubCard>

          {/* Daily Challenge */}
          <HubCard icon={<Trophy className="h-4 w-4" />} title="Daily Challenge" tone="from-amber-500/25 via-orange-500/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Play & Win 100 Coins</span>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">Medium</span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" /> Resets in {fmtTimeLeft(new Date(new Date().setUTCHours(24,0,0,0)).toISOString())}</p>
            <HubButton to="/games">Play Now</HubButton>
          </HubCard>

          {/* Rewards */}
          <HubCard icon={<Gift className="h-4 w-4" />} title="Rewards" tone="from-pink-500/25 via-rose-500/10">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/5 p-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Coins</div>
                <div className="font-bold text-yellow-300">{data.coins.toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">XP</div>
                <div className="font-bold text-primary">{data.xp.toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</div>
                <div className="font-bold text-accent">{data.level}</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {claimable > 0 ? `🎁 ${claimable} reward${claimable > 1 ? "s" : ""} ready` : "Come back tomorrow for your login reward."}
            </p>
            <HubButton to="/achievements">Claim Reward</HubButton>
          </HubCard>

          {/* Competitions */}
          <HubCard icon={<Swords className="h-4 w-4" />} title="Competitions" tone="from-rose-500/25 via-amber-500/10">
            {data.comps.length === 0 ? (
              <p className="text-xs text-muted-foreground">No live competitions right now.</p>
            ) : (
              <ul className="space-y-1.5">
                {data.comps.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium text-foreground">{c.name}</span>
                    <span className="ml-2 flex shrink-0 items-center gap-1 text-[10px] text-amber-300"><Clock className="h-2.5 w-2.5" /> {fmtTimeLeft(c.end_at)}</span>
                  </li>
                ))}
              </ul>
            )}
            <HubButton to="/competitions">Vote Now</HubButton>
          </HubCard>

          {/* Games */}
          <HubCard icon={<Gamepad2 className="h-4 w-4" />} title="Games" tone="from-cyan-500/25 via-blue-500/10">
            <div className="flex flex-wrap gap-1.5">
              {GAMES.map((g) => (
                <Link key={g.key} to={g.to} className="hub-chip">
                  <Gamepad2 className="h-3 w-3" /> {g.label}
                </Link>
              ))}
            </div>
            <HubButton to="/games">Play</HubButton>
          </HubCard>

          {/* Radio */}
          <HubCard icon={<Radio className="h-4 w-4" />} title="Radio" tone="from-fuchsia-500/25 via-purple-500/10">
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                {data.radio?.is_live && <span className="chat-online-dot" />}
                {data.radio?.host_name ?? "Off air"}
              </div>
              {data.radio?.now_playing && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">🎵 {data.radio.now_playing}</p>
              )}
              {data.radio?.next_host && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">Next: {data.radio.next_host}</p>
              )}
            </div>
            <HubButton to="/radio">Listen Now</HubButton>
          </HubCard>

          {/* Trending Feed */}
          <HubCard icon={<Flame className="h-4 w-4" />} title="Trending Feed" tone="from-orange-500/25 via-red-500/10">
            {data.trending ? (
              <p className="line-clamp-2 text-xs text-foreground">
                {data.trending.text || "A post is heating up in the community."}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Latest community activity awaits.</p>
            )}
            <HubButton to="/feed">Open Feed</HubButton>
          </HubCard>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HubCard({ icon, title, tone, children }: { icon: React.ReactNode; title: string; tone: string; children: React.ReactNode }) {
  return (
    <section className={`hub-card group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${tone} to-transparent p-3 shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:border-primary/30`}>
      <header className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-background/70 text-foreground ring-1 ring-white/10">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function HubButton({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/30 transition hover:brightness-110 active:scale-[0.98]"
    >
      {children} <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

// Hook exported so the chatroom can render the trigger + badge state anywhere.
const SEEN_KEY = "palrgo:hub:lastSeenAt";
export function useHubBadge(open: boolean) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [seenAt, setSeenAt] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem(SEEN_KEY) ?? 0);
  });

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    let n = 0;
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .maybeSingle();
      if (prof) n += 0; // baseline
    } catch { /* ignore */ }
    try {
      const { data: comps } = await supabase
        .from("competitions")
        .select("id,status,start_at")
        .eq("status", "live")
        .limit(10);
      const nowMs = Date.now();
      const fresh = (comps ?? []).filter((c) => !seenAt || new Date(c.start_at as string).getTime() > seenAt);
      n += fresh.length;
      void nowMs;
    } catch { /* ignore */ }
    setCount(n);
  }, [user?.id, seenAt]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (open) {
      const now = Date.now();
      setSeenAt(now);
      try { window.localStorage.setItem(SEEN_KEY, String(now)); } catch { /* ignore */ }
      setCount(0);
    }
  }, [open]);

  return count;
}
