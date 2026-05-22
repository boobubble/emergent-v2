import { useState, useEffect } from "react";
import { X, Trophy } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";

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
  const [name, setName] = useState(state.me.name);
  const [bio, setBio] = useState(state.me.bio || "");
  const [status, setStatus] = useState(state.me.status);

  useEffect(() => { if (open) { setName(state.me.name); setBio(state.me.bio || ""); setStatus(state.me.status); } }, [open, state.me]);

  if (!open) return null;
  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">Your Profile</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Avatar user={state.me} size={56} />
          <div>
            <div className="text-sm font-semibold">Level {state.me.level}</div>
            <div className="text-xs text-muted-foreground">{state.me.xp} XP earned</div>
          </div>
        </div>
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
  const { state } = useChat();
  if (!open) return null;
  const ranked = Object.values(state.users).sort((a,b) => b.xp - a.xp).slice(0, 10);
  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Trophy className="h-5 w-5 text-warning" /> Leaderboard</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="p-2">
        {ranked.map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
            <div className="w-6 text-center font-bold text-muted-foreground">{i + 1}</div>
            <Avatar user={u} size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{u.name}{u.isBot && <span className="ml-1 rounded bg-accent/20 px-1 text-[10px] font-bold uppercase text-accent">Bot</span>}</div>
              <div className="text-xs text-muted-foreground">Lv {u.level}</div>
            </div>
            <div className="font-mono text-sm text-accent">{u.xp} XP</div>
          </div>
        ))}
      </div>
    </Backdrop>
  );
}