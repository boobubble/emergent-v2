import { useEffect, useRef, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { Flame, Award, PanelLeftOpen } from "lucide-react";
import { useOptionalChat } from "@/lib/chat-store";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { MembersPanel } from "@/components/chat/MembersPanel";
import { FloatingDMDock } from "@/components/chat/FloatingDMDock";
import { TrioRoomsDock } from "@/components/chat/TrioRoomsDock";
import { PresenceFeed } from "@/components/chat/PresenceFeed";
import { DjFooter } from "@/components/chat/DjFooter";
import { PollDiscoveryWidget } from "@/components/chat/PollDiscoveryWidget";
import { ProfileModal, LeaderboardModal, AchievementsModal } from "@/components/chat/Modals";
import { ScheduledAnnouncementsRunner } from "@/components/chat/ScheduledAnnouncements";
import { BADGE_MAP } from "@/lib/achievements";

interface EngageToast { key: number; kind: "buzz" | "streak" | "badge"; title: string; body: string; }

export function ChatApp() {
  const chat = useOptionalChat();
  const [profileOpen, setProfileOpen] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [toast, setToast] = useState<EngageToast | null>(null);
  // Persist the user's sidebar open/closed choice across route switches and
  // browser resizes. Only fall back to auto-collapse on phones when the user
  // has never expressed a preference.
  const [sidebarOpen, setSidebarOpenState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = window.localStorage.getItem("palrgo:sidebarOpen");
      if (saved === "1") return true;
      if (saved === "0") return false;
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    return !window.matchMedia("(max-width: 640px)").matches;
  });
  const setSidebarOpen = (next: boolean) => {
    setSidebarOpenState(next);
    try {
      window.localStorage.setItem("palrgo:sidebarOpen", next ? "1" : "0");
    } catch {
      // ignore
    }
  };
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function show(t: EngageToast, buzz = false) {
      setToast(t);
      if (buzz) {
        const el = rootRef.current;
        if (el) {
          el.classList.remove("palrgo-buzzing");
          void el.offsetWidth;
          el.classList.add("palrgo-buzzing");
          setTimeout(() => el.classList.remove("palrgo-buzzing"), 750);
        }
      }
      setTimeout(() => setToast(curr => (curr && curr.key === t.key ? null : curr)), 3200);
    }
    function onBuzz(e: Event) {
      const ce = e as CustomEvent<{ actor?: string; reason: string }>;
      show({ key: Date.now(), kind: "buzz", title: ce.detail.actor ? `${ce.detail.actor} found` : "Rare find", body: `⚡ ${ce.detail.reason}` }, true);
    }
    function onStreak(e: Event) {
      const ce = e as CustomEvent<{ streak: number; bonus: number }>;
      show({ key: Date.now(), kind: "streak", title: `${ce.detail.streak}-day streak!`, body: `+${ce.detail.bonus} XP daily reward` });
    }
    function onBadge(e: Event) {
      const ce = e as CustomEvent<{ ids: string[] }>;
      const names = ce.detail.ids.map(id => BADGE_MAP[id]).filter(Boolean);
      if (!names.length) return;
      const head = names[0];
      const more = names.length > 1 ? ` (+${names.length - 1} more)` : "";
      show({ key: Date.now(), kind: "badge", title: "Achievement unlocked", body: `${head.emoji} ${head.name}${more}` });
    }
    window.addEventListener("palrgo:buzz", onBuzz);
    window.addEventListener("palrgo:streak", onStreak);
    window.addEventListener("palrgo:badge", onBadge);
    return () => {
      window.removeEventListener("palrgo:buzz", onBuzz);
      window.removeEventListener("palrgo:streak", onStreak);
      window.removeEventListener("palrgo:badge", onBadge);
    };
  }, []);

  if (!chat) return <Navigate to="/welcome" replace />;

  const { state, isDM } = chat;

  return (
    <>
      <div ref={rootRef} className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        {sidebarOpen && (
          <Sidebar
            onOpenProfile={() => setProfileOpen(true)}
            onOpenLeaderboard={() => setLbOpen(true)}
            onOpenAchievements={() => setAchOpen(true)}
            onCollapse={() => setSidebarOpen(false)}
          />
        )}
        <main className="relative flex h-full min-w-0 flex-1 flex-col">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-3 top-3.5 z-30 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 transition-all hover:scale-110 hover:shadow-xl hover:ring-primary/50"
              style={{ boxShadow: "var(--shadow-glow)" }}
              title="Show sidebar"
              aria-label="Show sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          )}
          <ChatHeader />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <MessageList channelId={state.activeChannel} />
            <PresenceFeed channelId={state.activeChannel} />
          </div>
          <PollDiscoveryWidget />
          <MessageInput />
          <DjFooter />
        </main>
        {!isDM(state.activeChannel) && <MembersPanel roomId={state.activeChannel} />}
        <FloatingDMDock />
        <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
        <LeaderboardModal open={lbOpen} onClose={() => setLbOpen(false)} />
        <AchievementsModal open={achOpen} onClose={() => setAchOpen(false)} />
        <ScheduledAnnouncementsRunner />
      </div>

      {toast && (
        <>
          {toast.kind === "buzz" && <div key={`flash-${toast.key}`} className="palrgo-buzz-flash" />}
          <div
            key={`toast-${toast.key}`}
            className="palrgo-buzz-toast flex items-center gap-2"
            onClick={() => { if (toast.kind === "badge") setAchOpen(true); }}
            role={toast.kind === "badge" ? "button" : undefined}
          >
            {toast.kind === "streak" && <Flame className="h-4 w-4 text-orange-400" />}
            {toast.kind === "badge" && <Award className="h-4 w-4 text-primary" />}
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">{toast.title}</span>
              <span>{toast.body}</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
