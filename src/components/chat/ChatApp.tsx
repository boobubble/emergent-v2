import { useEffect, useRef, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { Flame, Award, PanelLeftOpen, Star, X } from "lucide-react";
import { CommunityHub, useHubBadge } from "@/components/chat/CommunityHub";
import { ChatThemeStore } from "@/components/chat/ChatThemeStore";
import { useActiveChatTheme } from "@/lib/chat-themes";
import { useOptionalChat } from "@/lib/chat-store";
import { useHomePageMode } from "@/lib/use-home-page-mode";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { DMChatBackground } from "@/components/chat/DMChatBackground";
import { useDmTheme } from "@/lib/use-dm-theme";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/lib/app-settings";


import { useBotEventsNotifier } from "@/lib/use-bot-events-notifier";
import { MembersPanel } from "@/components/chat/MembersPanel";
import { FloatingDMDock } from "@/components/chat/FloatingDMDock";
import { MobileDMMinimizedDock } from "@/components/chat/MobileDMMinimizedDock";
import { TrioRoomsDock } from "@/components/chat/TrioRoomsDock";
import { PresenceFeed } from "@/components/chat/PresenceFeed";
import { DjFooter } from "@/components/chat/DjFooter";
import { PollDiscoveryWidget } from "@/components/chat/PollDiscoveryWidget";
import { ProfileModal, LeaderboardModal, AchievementsModal } from "@/components/chat/Modals";
import { ScheduledAnnouncementsRunner } from "@/components/chat/ScheduledAnnouncements";
import { BADGE_MAP } from "@/lib/achievements";
import { chatVariantFor } from "@/lib/theme-variants";

interface EngageToast { key: number; kind: "buzz" | "streak" | "badge"; title: string; body: string; }

export function ChatApp() {
  const chat = useOptionalChat();
  const { mode: homeMode } = useHomePageMode();
  const [profileOpen, setProfileOpen] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [toast, setToast] = useState<EngageToast | null>(null);
  const [hubOpen, setHubOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false,
  );
  const [feedbotChip, setFeedbotChip] = useState<{ title: string; body: string } | null>(null);
  const hubBadge = useHubBadge(hubOpen);
  useBotEventsNotifier();

  const { raw } = useAppSettings();
  useEffect(() => {
    if (!chat) return;
    const cfg = raw.chat_channels as { list?: { id: string; name: string; topic?: string }[] } | undefined;
    const list = Array.isArray(cfg?.list) ? cfg!.list : [];
    chat.syncAdminChannels(list);
  }, [raw.chat_channels, chat]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Listen for open-hub events dispatched from MembersPanel / anywhere.
  useEffect(() => {
    const open = () => setHubOpen(true);
    window.addEventListener("palrgo:open-hub", open);
    return () => window.removeEventListener("palrgo:open-hub", open);
  }, []);

  // FeedBot smart welcome + non-spammy topic reminders.
  // Rules:
  //  - One welcome chip per browser session (never repeats).
  //  - Follow-up topic reminders only after a long quiet interval,
  //    only when no chip is currently visible, one topic per session,
  //    and throttled globally across the app (localStorage cooldown).
  useEffect(() => {
    const SESSION_WELCOMED = "palrgo:hub:welcomed";
    const SESSION_TOPICS_SHOWN = "palrgo:hub:topicsShown";
    const LAST_REMINDER_AT = "palrgo:hub:lastReminderAt";
    const REMINDER_COOLDOWN_MS = 15 * 60 * 1000; // 15 min between any reminders
    const FIRST_TOPIC_DELAY_MS = 6 * 60 * 1000;  // wait 6 min after welcome

    const TOPICS: Record<string, { title: string; body: string }> = {
      missions:     { title: "🎯 New missions",   body: "Fresh missions are ready to claim." },
      challenges:   { title: "⚔️ Daily challenge", body: "A new challenge just went live." },
      rewards:      { title: "🎁 Rewards waiting", body: "Unclaimed coins & XP in your Hub." },
      competitions: { title: "🏆 Live competition", body: "A competition is running right now." },
      radio:        { title: "📻 Radio is on air",  body: "Tune in to what's playing now." },
      trending:     { title: "🔥 Trending on feed", body: "See what the community is loving." },
    };

    const readShown = (): string[] => {
      try { return JSON.parse(window.sessionStorage.getItem(SESSION_TOPICS_SHOWN) || "[]"); }
      catch { return []; }
    };
    const markShown = (key: string) => {
      try {
        const s = readShown();
        if (!s.includes(key)) s.push(key);
        window.sessionStorage.setItem(SESSION_TOPICS_SHOWN, JSON.stringify(s));
        window.localStorage.setItem(LAST_REMINDER_AT, String(Date.now()));
      } catch { /* ignore */ }
    };
    const canShowNow = () => {
      try {
        const last = Number(window.localStorage.getItem(LAST_REMINDER_AT) || 0);
        return Date.now() - last >= REMINDER_COOLDOWN_MS;
      } catch { return true; }
    };

    const timers: number[] = [];
    let welcomed = false;
    try { welcomed = window.sessionStorage.getItem(SESSION_WELCOMED) === "1"; } catch { /* ignore */ }

    if (!welcomed) {
      try { window.sessionStorage.setItem(SESSION_WELCOMED, "1"); } catch { /* ignore */ }
      timers.push(window.setTimeout(() => {
        setFeedbotChip({
          title: "👋 Welcome back",
          body: "You have missions, rewards & live events waiting.",
        });
        try { window.localStorage.setItem(LAST_REMINDER_AT, String(Date.now())); } catch { /* ignore */ }
      }, 1500));
    }

    const scheduleNextTopic = (delay: number) => {
      timers.push(window.setTimeout(() => {
        setFeedbotChip((current) => {
          if (current) { scheduleNextTopic(REMINDER_COOLDOWN_MS); return current; }
          if (!canShowNow()) { scheduleNextTopic(REMINDER_COOLDOWN_MS); return current; }
          const shown = readShown();
          const remaining = Object.keys(TOPICS).filter((k) => !shown.includes(k));
          if (remaining.length === 0) return current;
          const pick = remaining[Math.floor(Math.random() * remaining.length)];
          markShown(pick);
          scheduleNextTopic(REMINDER_COOLDOWN_MS);
          return TOPICS[pick];
        });
      }, delay));
    };

    scheduleNextTopic(FIRST_TOPIC_DELAY_MS);

    return () => { timers.forEach((t) => window.clearTimeout(t)); };
  }, []);
  // Persist the user's sidebar open/closed choice across route switches and
  // browser resizes. Only fall back to auto-collapse on phones when the user
  // has never expressed a preference.
  const [sidebarOpen, setSidebarOpenState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    try {
      const saved = window.localStorage.getItem("palrgo:sidebarOpen");
      if (saved === "1") return true;
      if (saved === "0") return false;
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    // Default: closed on mobile, open on desktop.
    return !isMobile;
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

  if (!chat) return <Navigate to={homeMode === "hero" ? "/heropage" : "/welcome"} replace />;

  const { state, isDM } = chat;
  const { theme: chatTheme, refresh: refreshChatTheme } = useActiveChatTheme();
  const [themeStoreOpen, setThemeStoreOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).auth.getUser().then((r: { data: { user: { id: string } | null } }) => setAuthUserId(r?.data?.user?.id ?? null));
  }, []);
  const activeIsDM = isDM(state.activeChannel);
  const dmTheme = useDmTheme(activeIsDM ? state.activeChannel : null, authUserId);
  const [chatVisible, setChatVisible] = useState(true);
  useEffect(() => {
    const onVis = () => setChatVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const open = () => setThemeStoreOpen(true);
    window.addEventListener("palrgo:open-chat-theme-store", open);
    return () => window.removeEventListener("palrgo:open-chat-theme-store", open);
  }, []);


  return (
    <>
      <div ref={rootRef} data-chat-theme={chatTheme} data-theme-variant={chatVariantFor(chatTheme)} className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        {sidebarOpen && (
          <>
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <div className="fixed inset-y-0 left-0 z-40 w-[85vw] max-w-xs shadow-2xl md:static md:z-auto md:w-auto md:max-w-none md:shadow-none">
              <Sidebar
                onOpenProfile={() => setProfileOpen(true)}
                onOpenLeaderboard={() => setLbOpen(true)}
                onOpenAchievements={() => setAchOpen(true)}
                onCollapse={() => setSidebarOpen(false)}
              />
            </div>
          </>
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

          <ChatHeader onOpenHub={() => setHubOpen(true)} hubOpen={hubOpen} />
          {(() => {
            const activeRoom = !activeIsDM ? state.rooms[state.activeChannel] : null;
            const isGameRoom = activeRoom?.kind === "game";
            if (isGameRoom && activeRoom) {
              return <GameRoomCanvas room={activeRoom} />;
            }
            return (
              <>
                <div className="relative flex min-h-0 flex-1 flex-col">
                  {activeIsDM && (
                    <DMChatBackground
                      wallpaper={dmTheme.wallpaper}
                      opacity={dmTheme.opacity}
                      blur={dmTheme.blur}
                      brightness={dmTheme.brightness}
                      overlay={dmTheme.overlay}
                      paused={!chatVisible}
                    />
                  )}
                  <MessageList channelId={state.activeChannel} />
                  <PresenceFeed channelId={state.activeChannel} />
                </div>

                <PollDiscoveryWidget />

                {/* FeedBot smart reminder chip (dismissible, one-per-session) */}
                {feedbotChip && (
                  <div className="pointer-events-auto mx-auto mb-2 flex w-[92%] max-w-md items-start gap-2 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 via-accent/10 to-transparent p-2.5 shadow-lg backdrop-blur-md md:mb-0">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="truncate text-[11px] font-bold text-foreground">{feedbotChip.title}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{feedbotChip.body}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setHubOpen(true); setFeedbotChip(null); }}
                      className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow"
                    >
                      Open Hub
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbotChip(null)}
                      aria-label="Dismiss"
                      className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <MessageInput />
              </>
            );
          })()}


          <DjFooter />
        </main>
        {!isDM(state.activeChannel) && <MembersPanel roomId={state.activeChannel} />}
        <FloatingDMDock />
        <MobileDMMinimizedDock />
        <TrioRoomsDock />
        <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
        <LeaderboardModal open={lbOpen} onClose={() => setLbOpen(false)} />
        <AchievementsModal open={achOpen} onClose={() => setAchOpen(false)} />
        <ScheduledAnnouncementsRunner />
        <ChatThemeStore
          open={themeStoreOpen}
          onOpenChange={setThemeStoreOpen}
          activeTheme={chatTheme}
          onThemeChange={refreshChatTheme}
        />
        <CommunityHub open={hubOpen} onOpenChange={setHubOpen} isMobile={isMobile} />
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
