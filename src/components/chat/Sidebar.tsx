import { useState } from "react";
import { Settings, Trophy, LogOut, RotateCcw, Award, Flame, PanelLeftClose } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface Props {
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onCollapse?: () => void;
}

export function Sidebar({ onOpenProfile, onOpenLeaderboard, onOpenAchievements, onCollapse }: Props) {
  const { state, setActive, createRoom, reset } = useChat();
  const { logout, user } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTopic, setNewTopic] = useState("");

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 p-5">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl text-xl font-bold text-primary-foreground"
          style={{ background: "var(--primary)", boxShadow: "var(--shadow-glow)" }}
        >
          P
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="font-bold text-foreground">Palrgo</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Social Chat
          </div>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            title="Hide sidebar"
            aria-label="Hide sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        <div>
          <SectionLabel
            title="Public Rooms"
            action={
              <button
                onClick={() => setShowNew(s => !s)}
                className="text-lg leading-none text-muted-foreground transition-colors hover:text-primary"
                aria-label="New room"
              >
                +
              </button>
            }
          />
          {showNew && (
            <div className="mb-2 space-y-1 rounded-2xl border border-border bg-background p-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Room name"
                className="w-full rounded-lg bg-input px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                placeholder="Topic"
                className="w-full rounded-lg bg-input px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={() => {
                  if (newName.trim()) {
                    createRoom(newName.trim(), newTopic.trim());
                    setNewName("");
                    setNewTopic("");
                    setShowNew(false);
                  }
                }}
                className="w-full rounded-lg bg-primary px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
              >
                Create
              </button>
            </div>
          )}
          <div className="space-y-1">
            {state.roomOrder.map(id => {
              const r = state.rooms[id];
              const active = state.activeChannel === id;
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-full px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-3 truncate">
                    <span
                      className={cn(
                        active ? "opacity-70" : "opacity-50 group-hover:text-primary",
                      )}
                    >
                      #
                    </span>
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px]",
                      active ? "bg-black/15" : "bg-white/5",
                    )}
                  >
                    {r.members.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </nav>

      <div className="border-t border-border p-3">
        <a
          href="/achievements"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-1 flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          title="Open achievements in new tab"
        >
          <Award className="h-4 w-4" /> Achievements
          <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            {state.me.badges?.length ?? 0}
          </span>
        </a>

        <div className="mb-2">
          <ThemeToggle />
        </div>
        <a
          href="/account"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-2xl bg-white/5 p-2 text-left transition-colors hover:bg-white/10"
          title="Open account settings in new tab"
        >
          <Avatar user={state.me} size={36} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-bold text-foreground">{state.me.name}</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span>Lv {state.me.level} · {state.me.xp} XP</span>
              {(state.me.streak ?? 0) > 0 && (
                <span className="flex items-center gap-0.5 text-orange-400">
                  <Flame className="h-2.5 w-2.5" />{state.me.streak}
                </span>
              )}
            </div>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </a>
        <button
          type="button"
          onClick={onOpenProfile}
          className="mt-1 w-full rounded-full px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          Quick edit profile
        </button>
        <div className="mt-2 flex gap-1">
          <button
            onClick={() => { if (confirm("Reset chat data for this account?")) reset(); }}
            className="flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            onClick={logout}
            className="flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive"
            title={user?.email}
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      <span>{title}</span>
      {action}
    </div>
  );
}
