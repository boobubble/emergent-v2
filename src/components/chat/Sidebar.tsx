import { useState } from "react";
import { Hash, MessageCircle, Plus, Settings, Trophy, LogOut } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface Props {
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
}

export function Sidebar({ onOpenProfile, onOpenLeaderboard }: Props) {
  const { state, setActive, createRoom, reset } = useChat();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTopic, setNewTopic] = useState("");

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div
          className="grid h-8 w-8 place-items-center rounded-md font-bold text-primary-foreground"
          style={{ background: "var(--gradient-accent)" }}
        >
          P
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Palrgo</div>
          <div className="text-xs text-muted-foreground">Chat & Games</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <SectionLabel
          title="Public Rooms"
          action={
            <button
              onClick={() => setShowNew(s => !s)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="New room"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        />
        {showNew && (
          <div className="mb-2 rounded-md border border-border bg-background p-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Room name"
              className="mb-1 w-full rounded bg-input px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              placeholder="Topic"
              className="mb-1 w-full rounded bg-input px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={() => {
                if (newName.trim()) { createRoom(newName.trim(), newTopic.trim()); setNewName(""); setNewTopic(""); setShowNew(false); }
              }}
              className="w-full rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Create
            </button>
          </div>
        )}
        {state.roomOrder.map(id => {
          const r = state.rooms[id];
          const active = state.activeChannel === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Hash className="h-4 w-4" />
              <span className="truncate">{r.name}</span>
              <span className={cn("ml-auto text-xs", active ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {r.members.length}
              </span>
            </button>
          );
        })}

        <SectionLabel title="Direct Messages" className="mt-4" />
        {state.dmOrder.length === 0 && (
          <div className="px-2 text-xs text-muted-foreground">Click a member to DM</div>
        )}
        {state.dmOrder.map(uid => {
          const u = state.users[uid];
          if (!u) return null;
          const cid = `dm:${uid}`;
          const active = state.activeChannel === cid;
          return (
            <button
              key={uid}
              onClick={() => setActive(cid)}
              className={cn(
                "mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="truncate">{u.name}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-border p-2">
        <button
          onClick={onOpenLeaderboard}
          className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Trophy className="h-4 w-4" /> Leaderboard
        </button>
        <button
          onClick={onOpenProfile}
          className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-muted"
        >
          <Avatar user={state.me} size={32} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-medium">{state.me.name}</div>
            <div className="text-xs text-muted-foreground">Lv {state.me.level} · {state.me.xp} XP</div>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => { if (confirm("Reset all chat data?")) reset(); }}
          className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-3 w-3" /> Reset demo
        </button>
      </div>
    </aside>
  );
}

function SectionLabel({ title, action, className }: { title: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-1 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      <span>{title}</span>
      {action}
    </div>
  );
}