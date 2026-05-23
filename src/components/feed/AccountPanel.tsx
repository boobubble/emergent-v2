import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload, Trash2, Save, LogOut, Coins, Flame, Trophy, Award, UserX, UserMinus, MessageCircle } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { Avatar } from "@/components/chat/Avatar";
import { ACCENTS, useAccent } from "@/lib/use-accent";
import { supabase } from "@/integrations/supabase/client";

export function AccountPanel() {
  const navigate = useNavigate();
  const { state, updateMe, removeFriend, unblockUser, startDM } = useChat();
  const { user: auth, logout } = useAuth();
  const me = state.me;
  const fileRef = useRef<HTMLInputElement>(null);
  const { accent, setAccent } = useAccent();

  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio ?? "");
  const [status, setStatus] = useState<typeof me.status>(me.status);
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!auth?.id) return;
    supabase.from("profiles").select("gender").eq("id", auth.id).maybeSingle()
      .then(({ data }) => {
        const g = (data as { gender?: string } | null)?.gender;
        if (g === "male" || g === "female" || g === "other") setGender(g);
      });
  }, [auth?.id]);

  const friends = (me.friends ?? []).map(id => state.users[id]).filter(Boolean);
  const blocked = (me.blocked ?? []).map(id => state.users[id]).filter(Boolean);
  const ranked = Object.values(state.users).sort((a, b) => b.xp - a.xp);
  const rank = ranked.findIndex(u => u.id === "me") + 1;

  const onPickAvatar = (file: File) => {
    if (file.size > 2_000_000) { alert("Image too large (max 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      updateMe({ avatarUrl: dataUrl });
      if (auth?.id) await supabase.from("profiles").update({ avatar_url: dataUrl }).eq("id", auth.id);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    const trimmed = name.trim();
    const letterCount = trimmed.replace(/[^a-zA-Z]/g, "").length;
    if (letterCount < 2 || letterCount > 10) {
      alert("Username must contain 2 to 10 letters.");
      return;
    }
    updateMe({ name: trimmed, bio: bio.trim(), status });
    if (auth?.id) {
      const patch: Record<string, unknown> = {
        username: trimmed,
        bio: bio.trim(),
        status,
      };
      if (gender) patch.gender = gender;
      const { error } = await supabase.from("profiles").update(patch).eq("id", auth.id);
      if (error) {
        alert(error.message.includes("duplicate") || error.code === "23505"
          ? "That username is already taken."
          : error.message);
        return;
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Account settings</h2>
        <button
          onClick={() => { logout(); navigate({ to: "/" }); }}
          className="flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive hover:bg-destructive/20"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-panel)" }}>
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2">
            <Avatar user={me} size={96} />
            <div className="flex gap-1">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary/25">
                <Upload className="h-3 w-3" /> Upload
              </button>
              {me.avatarUrl && (
                <button onClick={() => updateMe({ avatarUrl: undefined })} className="flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1 text-[11px] font-bold text-destructive hover:bg-destructive/25">
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onPickAvatar(e.target.files[0])} />
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <Field label="Username (2–10 letters)">
              <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="your display name" />
            </Field>
            <Field label="Bio">
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={160} className="w-full resize-none rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="A short bio…" />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{bio.length}/160</p>
            </Field>
            <Field label="Status">
              <div className="flex gap-2">
                {(["online", "away", "offline"] as const).map(s => (
                  <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${status === s ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Gender">
              <div className="flex gap-2">
                {(["male", "female", "other"] as const).map(g => (
                  <button key={g} onClick={() => setGender(g)} className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider capitalize transition ${gender === g ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={save} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
                <Save className="h-4 w-4" /> Save changes
              </button>
              {saved && <span className="text-xs font-semibold text-primary">✓ Saved</span>}
              {auth?.email && <span className="ml-auto text-[11px] text-muted-foreground">Signed in as {auth.email}</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Level" value={`Lv ${me.level}`} icon={<Award className="h-3.5 w-3.5 text-primary" />} />
        <Stat label="XP" value={`${me.xp}`} icon={<Trophy className="h-3.5 w-3.5 text-warning" />} />
        <Stat label="Coins" value={`${me.coins ?? 0}`} icon={<Coins className="h-3.5 w-3.5 text-yellow-500" />} />
        <Stat label="Rank" value={rank ? `#${rank}` : "—"} icon={<Flame className="h-3.5 w-3.5 text-orange-400" />} />
      </section>

      <section>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Accent color</h3>
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-3 sm:grid-cols-3">
          {ACCENTS.map(a => {
            const active = accent === a.id;
            return (
              <button key={a.id} onClick={() => setAccent(a.id)} className={`group flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${active ? "border-transparent ring-2 ring-primary" : "border-border hover:bg-white/5"}`}>
                <span className="h-7 w-7 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: a.gradient }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">{a.label}</span>
                  {active && <span className="text-[10px] font-semibold text-primary">Active</span>}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">No friends yet.</p>
        ) : (
          <ul className="grid gap-2">
            {friends.map(u => (
              <li key={u.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2">
                <Avatar user={u} size={36} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-bold">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground">Lv {u.level} · {u.xp} XP</div>
                </div>
                <button onClick={() => { startDM(u.id); navigate({ to: "/" }); }} className="rounded-full bg-primary/15 p-1.5 text-primary hover:bg-primary/25" title="Send message"><MessageCircle className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeFriend(u.id)} className="rounded-full bg-white/5 p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" title="Remove friend"><UserMinus className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Blocked ({blocked.length})</h3>
        {blocked.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">No blocked users.</p>
        ) : (
          <ul className="grid gap-2">
            {blocked.map(u => (
              <li key={u.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2">
                <Avatar user={u} size={36} />
                <div className="min-w-0 flex-1 truncate text-sm font-bold">{u.name}</div>
                <button onClick={() => unblockUser(u.id)} className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground"><UserX className="h-3 w-3" /> Unblock</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
