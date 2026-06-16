import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, LogOut, RotateCcw, Award, Flame, PanelLeftClose, Zap } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/BrandMark";
import { ChatExploreMenu } from "./ChatExploreMenu";
import { levelProgress } from "@/lib/ranks";


interface Props {
  onOpenProfile: () => void;
  onOpenLeaderboard?: () => void;
  onOpenAchievements?: () => void;
  onCollapse?: () => void;
}

export function Sidebar({ onOpenProfile, onCollapse }: Props) {
  const { t } = useTranslation();
  const { state, setActive, createRoom, reset } = useChat();
  const { logout, user } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTopic, setNewTopic] = useState("");

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-transparent p-2">
      <div className="flex h-full flex-col premium-floating-sidebar overflow-hidden">

      <div className="flex items-center gap-3 p-5">
        <BrandMark
          slot="chat"
          alt="Logo"
          className="h-10 w-10 rounded-xl object-contain"
          fallback={
            <div
              className="grid h-10 w-10 place-items-center rounded-xl text-xl font-bold text-primary-foreground"
              style={{ background: "var(--primary)", boxShadow: "var(--shadow-glow)" }}
            >
              P
            </div>
          }
        />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="font-bold text-foreground">Palrgo</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("chat.social")}
          </div>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30 transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground"
            title={t("chat.hideSidebar")}
            aria-label={t("chat.hideSidebar")}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        <div>
          <SectionLabel
            title={t("chat.publicRooms")}
            action={
              <button
                onClick={() => setShowNew(s => !s)}
                className="text-lg leading-none text-muted-foreground transition-colors hover:text-primary"
                aria-label={t("chat.newRoom")}
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
                placeholder={t("chat.roomName")}
                className="w-full rounded-lg bg-input px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                placeholder={t("chat.topic")}
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
                {t("chat.create")}
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
                    "premium-nav-item",
                    active && "premium-nav-item-active",
                  )}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span className={cn("text-base leading-none", active ? "text-primary" : "opacity-50")}>
                      #
                    </span>
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px]">
                    <span className="chat-online-dot" aria-hidden style={{ width: "0.4rem", height: "0.4rem" }} />
                    <span className="font-semibold opacity-80">{r.members.length}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </nav>


      <div className="border-t border-border p-3">
        <div className="mb-2 hidden lg:block">
          <ChatExploreMenu />
        </div>



        {!user?.isGuest && (
          <a
            href="/feed"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1 flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            title="Open achievements & leaderboard in feed"
          >
            <Award className="h-4 w-4" /> {t("nav.achievements")}
            <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {state.me.badges?.length ?? 0}
            </span>
          </a>
        )}

        <div className="mb-2">
          <ThemeToggle />
        </div>
        <a
          href={user?.isGuest ? "#" : "/account"}
          target={user?.isGuest ? undefined : "_blank"}
          rel={user?.isGuest ? undefined : "noopener noreferrer"}
          onClick={(e) => { if (user?.isGuest) e.preventDefault(); }}
          className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-card/60 p-3 text-left transition-all hover:border-primary/30 hover:bg-card"
          title={user?.isGuest ? "Guest session" : "Open account settings in new tab"}
        >

          <div className="relative flex items-center gap-3">
            <Avatar user={state.me} size={36} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-bold text-foreground">{state.me.name}</div>
              {user?.isGuest ? (
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Guest</div>
              ) : (
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-fuchsia-500/20 px-1.5 py-0.5 font-bold text-amber-200 ring-1 ring-amber-400/30">
                    <Zap className="h-2.5 w-2.5" /> Lv {state.me.level}
                  </span>
                  {(state.me.streak ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-1.5 py-0.5 font-bold text-rose-300 ring-1 ring-rose-400/30">
                      <Flame className="h-2.5 w-2.5" />{state.me.streak}d
                    </span>
                  )}
                </div>
              )}
            </div>
            {!user?.isGuest && <Settings className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />}
          </div>
          {!user?.isGuest && (() => {
            const lp = levelProgress(state.me.xp ?? 0);
            return (
              <div className="relative mt-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-fuchsia-500 shadow-[0_0_10px_rgba(251,191,36,0.6)] transition-all duration-700"
                    style={{ width: `${lp.pct}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] font-semibold text-muted-foreground">
                  <span>{(state.me.xp ?? 0).toLocaleString()} XP</span>
                  <span>{lp.intoLevel}/{lp.toNext} → Lv {lp.level + 1}</span>
                </div>
              </div>
            );
          })()}
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
