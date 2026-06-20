import { useState, useEffect, useMemo } from "react";
import { X, Trophy, Flame, Award, Lock } from "lucide-react";
import { toast } from "sonner";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "./Avatar";
import { BADGES, BADGE_MAP, TIER_COLOR } from "@/lib/achievements";

const ABOUT_WORD_LIMIT = 100;
function countWords(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/u).length;
}

function Backdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-lg border border-border bg-card shadow-2xl" style={{ boxShadow: "var(--shadow-panel)" }}>
        {children}
      </div>
    </div>
  );
}

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, updateMe } = useChat();
  const { user: authUser } = useAuth();
  const [name, setName] = useState(state.me.name);
  const [bio, setBio] = useState(state.me.bio || "");
  const [aboutMe, setAboutMe] = useState(state.me.aboutMe || "");
  const [status, setStatus] = useState(state.me.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(state.me.name);
      setBio(state.me.bio || "");
      setAboutMe(state.me.aboutMe || "");
      setStatus(state.me.status);
    }
  }, [open, state.me]);

  const wordCount = useMemo(() => countWords(aboutMe), [aboutMe]);
  const overLimit = wordCount > ABOUT_WORD_LIMIT;

  if (!open) return null;
  const earnedBadges = (state.me.badges || []).map(id => BADGE_MAP[id]).filter(Boolean);
  const xpForLevel = state.me.level * 50;
  const xpThisLevel = state.me.xp - (state.me.level - 1) * 50;
  const pct = Math.min(100, Math.round((xpThisLevel / 50) * 100));

  const handleAboutChange = (val: string) => {
    // Soft-cap by words: allow typing but block save when over limit.
    // Also hard-cap chars at 1000 to match DB constraint.
    setAboutMe(val.slice(0, 1000));
  };

  const handleSave = async () => {
    if (overLimit) {
      toast.error(`About me must be ${ABOUT_WORD_LIMIT} words or fewer`);
      return;
    }
    const cleanName = name.trim() || state.me.name;
    const cleanBio = bio.trim();
    const cleanAbout = aboutMe.trim();
    updateMe({ name: cleanName, bio: cleanBio, aboutMe: cleanAbout, status });
    if (authUser?.id) {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({ bio: cleanBio || null, about_me: cleanAbout || null })
        .eq("id", authUser.id);
      setSaving(false);
      if (error) {
        toast.error(error.message || "Couldn't save profile");
        return;
      }
    }
    onClose();
  };

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">Your Profile</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
        <div className="flex items-center gap-3">
          <Avatar user={state.me} size={56} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Level {state.me.level}</div>
            <div className="text-xs text-muted-foreground">{state.me.xp} / {xpForLevel} XP</div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-white/5 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Flame className="h-3 w-3 text-orange-400" /> Daily streak
            </div>
            <div className="mt-1 text-lg font-bold">{state.me.streak ?? 0} day{(state.me.streak ?? 0) === 1 ? "" : "s"}</div>
            <div className="text-[10px] text-muted-foreground">Best: {state.me.longestStreak ?? 0}</div>
          </div>
          <div className="rounded-xl border border-border bg-white/5 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Award className="h-3 w-3 text-primary" /> Badges
            </div>
            <div className="mt-1 text-lg font-bold">{earnedBadges.length} / {BADGES.length}</div>
            <div className="text-[10px] text-muted-foreground">{state.me.messageCount ?? 0} messages sent</div>
          </div>
        </div>

        {earnedBadges.length > 0 && (
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Earned</div>
            <div className="flex flex-wrap gap-1.5">
              {earnedBadges.map(b => (
                <div key={b.id} className={`flex items-center gap-1 rounded-full border bg-gradient-to-br px-2.5 py-1 text-[11px] font-semibold ${TIER_COLOR[b.tier]}`} title={b.description}>
                  <span>{b.emoji}</span>{b.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Display name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="w-full resize-none rounded bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Status</label>
          <div className="flex gap-2">
            {(["online","away","offline"] as const).map(s => (
              <button key={s} onClick={() => setStatus(s)} className={`flex-1 rounded px-3 py-1.5 text-xs font-medium capitalize ${status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border p-3">
        <button onClick={onClose} className="rounded px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        <button
          onClick={() => { updateMe({ name: name.trim() || state.me.name, bio, status }); onClose(); }}
          className="rounded px-4 py-1.5 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-accent)" }}
        >
          Save
        </button>
      </div>
    </Backdrop>
  );
}

export function LeaderboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, adjustPoints } = useChat();
  const [tab, setTab] = useState<"xp" | "streak">("xp");
  if (!open) return null;
  const all = Object.values(state.users);
  const ranked = tab === "xp"
    ? [...all].sort((a, b) => b.xp - a.xp).slice(0, 10)
    : [...all].sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0) || (b.longestStreak ?? 0) - (a.longestStreak ?? 0)).slice(0, 10);

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Trophy className="h-5 w-5 text-warning" /> Leaderboard</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-1 border-b border-border px-3 py-2">
        <button
          onClick={() => setTab("xp")}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "xp" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"}`}
        >
          <Trophy className="mr-1 inline h-3 w-3" /> Top XP
        </button>
        <button
          onClick={() => setTab("streak")}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "streak" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"}`}
        >
          <Flame className="mr-1 inline h-3 w-3" /> Top Streaks
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {ranked.map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
            <div className="w-6 text-center font-bold text-muted-foreground">{i + 1}</div>
            <Avatar user={u} size={32} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 truncate text-sm font-medium">
                {u.name}
                {u.isBot && <span className="rounded bg-accent/20 px-1 text-[10px] font-bold uppercase text-accent">Bot</span>}
                {(u.badges || []).slice(0, 3).map(bid => {
                  const b = BADGE_MAP[bid]; if (!b) return null;
                  return <span key={bid} title={b.name} className="text-xs">{b.emoji}</span>;
                })}
              </div>
              <div className="text-xs text-muted-foreground">Lv {u.level} · 🔥 {u.streak ?? 0}</div>
            </div>
            {tab === "xp" ? (
              <div className="font-mono text-sm text-accent">{u.xp} XP</div>
            ) : (
              <div className="font-mono text-sm text-orange-400">{u.streak ?? 0}d</div>
            )}
            <div className="flex gap-1">
              <button onClick={() => adjustPoints(u.id, -10)} className="grid h-6 w-6 place-items-center rounded bg-muted text-xs hover:bg-destructive/30" title="-10 XP">−</button>
              <button onClick={() => adjustPoints(u.id, 10)} className="grid h-6 w-6 place-items-center rounded bg-muted text-xs hover:bg-primary/30" title="+10 XP">+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">Adjust points with +/−. Streaks rise by signing in on consecutive days.</div>
    </Backdrop>
  );
}

export function AchievementsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useChat();
  if (!open) return null;
  const earned = new Set(state.me.badges || []);
  const earnedCount = earned.size;

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Award className="h-5 w-5 text-primary" /> Achievements</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="border-b border-border px-4 py-3">
        <div className="text-xs text-muted-foreground">Unlocked</div>
        <div className="text-2xl font-bold">{earnedCount} <span className="text-sm text-muted-foreground">/ {BADGES.length}</span></div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${(earnedCount / BADGES.length) * 100}%` }} />
        </div>
      </div>
      <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
        {BADGES.map(b => {
          const has = earned.has(b.id);
          return (
            <div
              key={b.id}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${has ? `bg-gradient-to-br ${TIER_COLOR[b.tier]}` : "border-border bg-white/[0.02] text-muted-foreground"}`}
            >
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-2xl ${has ? "bg-black/20" : "bg-white/5"}`}>
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
    </Backdrop>
  );
}
