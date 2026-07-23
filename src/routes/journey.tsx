import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Lock, Sparkles, Trophy, Target, Award, ChevronRight, Rocket, CheckCircle2 } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useProgressionConfig } from "@/lib/progression-flags";
import {
  DISCOVERY_MISSIONS,
  JOURNEY_STAGES,
  nextStage,
  nextUnlock,
  resolveAllUnlocks,
  stageForLevel,
  upcomingUnlocks,
  xpBreakdown,
  XP_PER_LEVEL,
} from "@/lib/journey";
import { BADGES, TIER_COLOR } from "@/lib/achievements";
import { JourneyDaily } from "@/components/journey/JourneyDaily";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Your Journey — Progression & Unlocks" },
      { name: "description", content: "Track your level, XP, unlocks, missions and achievements as you grow on the platform." },
      { property: "og:title", content: "Your Journey — Progression & Unlocks" },
      { property: "og:description", content: "Track your level, XP, unlocks, missions and achievements as you grow." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const { state } = useChat();
  const cfg = useProgressionConfig();
  const me = state.me;
  const level = me?.level ?? 1;
  const xp = me?.xp ?? 0;

  const breakdown = useMemo(() => xpBreakdown(xp, level), [xp, level]);
  const stage = useMemo(() => stageForLevel(level), [level]);
  const nStage = useMemo(() => nextStage(level), [level]);
  const nUnlock = useMemo(() => nextUnlock(level, xp, cfg), [level, xp, cfg]);
  const roadmap = useMemo(() => upcomingUnlocks(level, xp, cfg, 6), [level, xp, cfg]);
  const all = useMemo(() => resolveAllUnlocks(level, xp, cfg), [level, xp, cfg]);
  const unlockedCount = all.filter((u) => u.unlocked).length;
  const totalCount = all.length;

  const earnedBadges = new Set(me?.badges ?? []);
  const missions = DISCOVERY_MISSIONS.map((m) => ({ ...m, done: m.done(me ?? {}) }));

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 pb-24">
      {/* Hero */}
      <section className={`relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${stage.accent} p-5`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-4xl backdrop-blur">
            {stage.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">Your Journey</div>
            <div className="text-2xl font-bold">{stage.name}</div>
            <div className="text-xs opacity-80">{stage.description}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider opacity-80">Level</div>
            <div className="text-3xl font-bold">{level}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[11px] opacity-80">
            <span>{breakdown.xpIntoLevel} / {breakdown.xpForLevel} XP</span>
            <span>{breakdown.pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/15">
            <div className="h-full bg-white/70 transition-all" style={{ width: `${breakdown.pct}%` }} />
          </div>
          <div className="mt-1.5 text-[11px] opacity-80">
            {breakdown.xpToNext > 0
              ? <>Only <span className="font-semibold">{breakdown.xpToNext} XP</span> to Level {level + 1}.</>
              : "Ready to level up!"}
          </div>
        </div>

        {nStage && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-[11px] font-semibold backdrop-blur">
            Next stage {nStage.emoji} {nStage.name} · Level {nStage.minLevel}
          </div>
        )}
      </section>

      {/* Stat strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Sparkles className="h-4 w-4" />} label="XP" value={xp.toLocaleString()} />
        <Stat icon={<Trophy className="h-4 w-4" />} label="Unlocked" value={`${unlockedCount}/${totalCount}`} />
        <Stat icon={<Award className="h-4 w-4" />} label="Badges" value={`${earnedBadges.size}/${BADGES.length}`} />
        <Stat icon={<Target className="h-4 w-4" />} label="Missions" value={`${missions.filter((m) => m.done).length}/${missions.length}`} />
      </section>

      {/* Next reward */}
      {nUnlock && (
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Rocket className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Next reward</div>
              <div className="text-sm font-bold">{nUnlock.def.label}</div>
              <div className="text-xs text-muted-foreground">{nUnlock.def.description} · Unlocks at Level {nUnlock.requiredLevel}</div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Level {level} → Level {nUnlock.requiredLevel}</span>
                  <span>{nUnlock.progressPct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${nUnlock.progressPct}%` }} />
                </div>
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                  Only <span className="font-semibold text-foreground">{nUnlock.xpRemaining} XP</span> remaining.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live daily missions + challenges (shared with Feed) */}
      {me?.id && (
        <Section title="Today's Missions & Challenges" hint="Reset every 24 hours · tap any item for details and to claim XP.">
          <JourneyDaily meId={me.id} />
        </Section>
      )}

      {/* Discovery missions */}
      <Section title="Discovery Missions" hint="Guided steps to explore the platform.">

        <div className="grid gap-2 sm:grid-cols-2">
          {missions.map((m) => (
            <div key={m.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${m.done ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-background/50"}`}>
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${m.done ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {m.done ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{m.label}</div>
                <div className="text-[11px] text-muted-foreground">{m.description}</div>
              </div>
              {!m.done && (
                <Link to={m.cta.to} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/15">
                  {m.cta.label} <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Roadmap */}
      <Section title="Upcoming Roadmap" hint="What unlocks as you level up next.">
        <div className="rounded-2xl border border-border bg-background/50 p-2">
          {roadmap.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">You've unlocked everything available. 🎉</div>
          )}
          {roadmap.map((u) => (
            <div key={u.def.key} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/40">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{u.def.label}</div>
                <div className="truncate text-[11px] text-muted-foreground">{u.def.description}</div>
              </div>
              <div className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Lv {u.requiredLevel}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Stages */}
      <Section title="Journey Stages">
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {JOURNEY_STAGES.map((s) => {
            const reached = level >= s.minLevel;
            const isCurrent = s.id === stage.id;
            return (
              <div key={s.id} className={`rounded-2xl border p-3 transition-all ${reached ? `bg-gradient-to-br ${s.accent} border-transparent` : "border-border bg-white/[0.02] text-muted-foreground"} ${isCurrent ? "ring-2 ring-primary/50" : ""}`}>
                <div className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="font-bold">{s.name}</span>
                  {isCurrent && <span className="ml-auto rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">You</span>}
                </div>
                <div className="mt-1 text-[11px] opacity-80">Level {s.minLevel}+</div>
                <div className="mt-1 text-xs opacity-80">{s.description}</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Unlocked features */}
      <Section title="Unlocked Features" hint={`${unlockedCount} of ${totalCount} available.`}>
        <div className="grid gap-2 sm:grid-cols-2">
          {all.filter((u) => u.unlocked).slice(0, 12).map((u) => (
            <div key={u.def.key} className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{u.def.label}</div>
                <div className="truncate text-[11px] text-muted-foreground">{u.def.description}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Achievements */}
      <Section title="Achievements" hint={`${earnedBadges.size} of ${BADGES.length} earned.`}>
        <div className="grid gap-2 sm:grid-cols-2">
          {BADGES.map((b) => {
            const has = earnedBadges.has(b.id);
            return (
              <div key={b.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${has ? `bg-gradient-to-br ${TIER_COLOR[b.tier]}` : "border-border bg-white/[0.02] text-muted-foreground"}`}>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xl ${has ? "bg-black/20" : "bg-white/5"}`}>
                  {has ? b.emoji : <Lock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {b.name}
                    <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">{b.tier}</span>
                  </div>
                  <div className="text-xs opacity-80">{b.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <div className="pt-4 text-center text-[11px] text-muted-foreground">
        Every {XP_PER_LEVEL} XP = 1 level · Admins can tune unlocks under Progression settings.
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/50 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-end justify-between px-1">
        <h2 className="text-sm font-bold">{title}</h2>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      {children}
    </section>
  );
}
