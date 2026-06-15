import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Home, Users, Sparkles, Flame, Clock, UserCircle, Settings, MessageCircle, Bookmark, Bell, Newspaper, Trophy, Award, Gift, Coins, Film, FileText, Users2, CirclePlus, Plus, Menu, X, UserPlus } from "lucide-react";
import chatroomIcon from "@/assets/chatroom-icon.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useChat } from "@/lib/chat-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { useFeedPrefs } from "@/lib/feed-prefs";
import { Composer } from "@/components/feed/Composer";
import { StoryTray } from "@/components/feed/StoryTray";
import { PostCard } from "@/components/feed/PostCard";
import { FriendsWidget, HashtagsWidget, ChatroomOnlineWidget } from "@/components/feed/SideWidgets";
import { ConfessionsFeedWidget, ActivePollsWidget } from "@/components/feed/ConfessionsFeedWidget";
import { BoobubbleAssistantWidget } from "@/components/feed/BoobubbleAssistantWidget";
import { DailyChallengesWidget } from "@/components/feed/DailyChallengesWidget";
import { BirthdaysWidget } from "@/components/feed/BirthdaysWidget";
import { MissionsPanel } from "@/components/feed/MissionsPanel";
import { FeedNotifications } from "@/components/feed/FeedNotifications";
import { Avatar } from "@/components/chat/Avatar";
import type { FeedPost, FeedFriendship } from "@/lib/feed-types";
import { pingDailyStreak } from "@/lib/gamification.functions";
import { BrandMark } from "@/components/BrandMark";
import { PostSkeleton, WidgetSkeleton, RewardsWidgetSkeleton } from "@/components/feed/FeedSkeletons";

// Lazy-loaded panels — only fetched when the user navigates to them, keeping
// the initial feed bundle small for faster first paint.
const AccountPanel = lazy(() => import("@/components/feed/AccountPanel").then(m => ({ default: m.AccountPanel })));
const ProfilePanel = lazy(() => import("@/components/feed/ProfilePanel").then(m => ({ default: m.ProfilePanel })));
const FeedSettingsPanel = lazy(() => import("@/components/feed/FeedSettingsPanel").then(m => ({ default: m.FeedSettingsPanel })));
const AchievementsPanel = lazy(() => import("@/components/feed/AchievementsPanel").then(m => ({ default: m.AchievementsPanel })));
const LeaderboardPanel = lazy(() => import("@/components/feed/LeaderboardPanel").then(m => ({ default: m.LeaderboardPanel })));
const FindFriendsPanel = lazy(() => import("@/components/feed/FindFriendsPanel").then(m => ({ default: m.FindFriendsPanel })));
const DailyChestPanel = lazy(() => import("@/components/feed/DailyChestPanel").then(m => ({ default: m.DailyChestPanel })));
const SpinWheelPanel = lazy(() => import("@/components/feed/SpinWheelPanel").then(m => ({ default: m.SpinWheelPanel })));
const ShopPanel = lazy(() => import("@/components/feed/ShopPanel").then(m => ({ default: m.ShopPanel })));
const RewardsWidget = lazy(() => import("@/components/feed/RewardsWidget").then(m => ({ default: m.RewardsWidget })));
const FeedDMDock = lazy(() => import("@/components/feed/FeedDMDock").then(m => ({ default: m.FeedDMDock })));

const PanelFallback = () => (
  <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
);

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed — Palrgo" },
      { name: "description", content: "Share posts, react, comment, and connect with friends on Palrgo." },
      { property: "og:title", content: "Feed — Palrgo" },
      { property: "og:description", content: "Lightweight social feed for the Palrgo community." },
    ],
  }),
  component: FeedPage,
});

type Tab = "foryou" | "trending" | "latest" | "friends" | "saved" | "notifications";
type View = "feed" | "account" | "profile" | "settings" | "achievements" | "leaderboard" | "findFriends" | "dailyChest" | "spin" | "shop";

function isVisibleFeedTab(tab: string): tab is Tab {
  return ["foryou", "trending", "latest", "friends", "saved", "notifications"].includes(tab);
}

function normalizePost(row: Partial<FeedPost>): FeedPost {
  return {
    id: row.id ?? "",
    author_id: row.author_id ?? "",
    owner_id: row.owner_id ?? row.author_id ?? "",
    kind: row.kind ?? "text",
    text: row.text ?? "",
    slug: row.slug ?? row.id ?? "post",
    media_urls: Array.isArray(row.media_urls) ? row.media_urls : [],
    poll: row.poll ?? null,
    privacy: row.privacy ?? "public",
    is_anonymous: Boolean(row.is_anonymous),
    hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
    reaction_count: row.reaction_count ?? 0,
    comment_count: row.comment_count ?? 0,
    trending_score: row.trending_score ?? 0,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function getInitialView(): { view: View; username: string } {
  if (typeof window === "undefined") return { view: "feed", username: "" };
  const sp = new URLSearchParams(window.location.search);
  if (sp.get("u")) return { view: "profile", username: sp.get("u") || "" };
  if (sp.get("tab") === "account") return { view: "account", username: "" };
  return { view: "feed", username: "" };
}

function FeedPage() {
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const { prefs } = useFeedPrefs();
  const [tab, setTabState] = useState<Tab>(isVisibleFeedTab(prefs.defaultTab) ? prefs.defaultTab : "foryou");
  const initial = getInitialView();
  const [view, setView] = useState<View>(initial.view);
  const [profileUsername, setProfileUsername] = useState<string>(initial.username);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dmOpenKey, setDmOpenKey] = useState(0);
  const [defaultTabApplied, setDefaultTabApplied] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const focusComposer = () => {
    setView("feed");
    setTimeout(() => {
      const ta = document.querySelector<HTMLTextAreaElement>('textarea[placeholder^="What\u2019s on your mind"], textarea[placeholder^="What\'s on your mind"]');
      ta?.focus();
      ta?.click();
      ta?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };



  const meId = user?.id ?? "";

  function setTab(next: Tab) {
    setTabState(next);
  }

  // Apply the saved default tab once prefs hydrate from localStorage
  useEffect(() => {
    if (defaultTabApplied) return;
    setTab(isVisibleFeedTab(prefs.defaultTab) ? prefs.defaultTab : "foryou");
    setDefaultTabApplied(true);
  }, [prefs.defaultTab, defaultTabApplied]);

  // Daily streak ping on mount
  useEffect(() => {
    if (!meId) return;
    void pingDailyStreak().catch((e: unknown) => console.error("streak ping failed", e));
  }, [meId]);

  // Load friendships
  useEffect(() => {
    if (!meId) return;
    async function loadF() {
      const { data } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`);
      const ids = new Set<string>();
      ((data ?? []) as FeedFriendship[]).forEach((f) => {
        ids.add(f.sender_id === meId ? f.receiver_id : f.sender_id);
      });
      setFriendIds(ids);
    }
    loadF();
    const ch = supabase.channel(`feed-fr-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => loadF()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  // Load posts
  async function loadPosts() {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
    setPosts(((data ?? []) as Partial<FeedPost>[]).map(normalizePost));
    setLoading(false);
  }

  useEffect(() => {
    if (!meId) return;
    loadPosts();
    const ch = supabase.channel("feed-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, (payload) => {
        if (payload.eventType === "INSERT") setPosts((p) => [normalizePost(payload.new as Partial<FeedPost>), ...p]);
        else if (payload.eventType === "DELETE") setPosts((p) => p.filter((x) => x.id !== (payload.old as FeedPost).id));
        else if (payload.eventType === "UPDATE") setPosts((p) => p.map((x) => x.id === (payload.new as FeedPost).id ? normalizePost(payload.new as Partial<FeedPost>) : x));
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  const filtered = useMemo(() => {
    let list = [...posts];

    // Content filters (apply before sort)
    if (prefs.hideMedia) {
      list = list.filter(p => !(p.media_urls && p.media_urls.length > 0));
    }
    if (prefs.mutedKeywords.length > 0) {
      list = list.filter(p => {
        const t = (p.text || "").toLowerCase();
        return !prefs.mutedKeywords.some(k => t.includes(k));
      });
    }
    if (prefs.mutedHashtags.length > 0) {
      list = list.filter(p => {
        const tags = (p.hashtags || []).map(t => t.toLowerCase());
        return !prefs.mutedHashtags.some(k => tags.includes(k));
      });
    }

    // Sort: explicit override wins over tab-driven sort
    const effective = prefs.sortOverride !== "smart" ? prefs.sortOverride : tab;
    if (effective === "trending" || tab === "trending") {
      list.sort((a, b) => {
        const sa = a.reaction_count * 2 + a.comment_count * 3;
        const sb = b.reaction_count * 2 + b.comment_count * 3;
        return sb - sa;
      });
    } else if (effective === "latest" || tab === "latest") {
      list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    } else if (tab === "friends") {
      list = list.filter((p) => friendIds.has(p.owner_id) || p.owner_id === meId);
    } else {
      list.sort((a, b) => {
        const af = friendIds.has(a.owner_id) ? 1 : 0;
        const bf = friendIds.has(b.owner_id) ? 1 : 0;
        if (af !== bf) return bf - af;
        return +new Date(b.created_at) - +new Date(a.created_at);
      });
    }
    // Search filter (text / #hashtag / @username)
    const q = query.trim().toLowerCase();
    if (q) {
      const isTag = q.startsWith("#");
      const isUser = q.startsWith("@");
      const needle = (isTag || isUser) ? q.slice(1) : q;
      list = list.filter((p) => {
        const text = (p.text || "").toLowerCase();
        const tags = (p.hashtags || []).map(t => t.toLowerCase());
        const author = profiles[p.owner_id]?.name?.toLowerCase() ?? "";
        if (isTag) return tags.some(t => t.includes(needle));
        if (isUser) return author.includes(needle);
        return text.includes(needle) || tags.some(t => t.includes(needle)) || author.includes(needle);
      });
    }

    return list;
  }, [posts, tab, friendIds, meId, prefs.hideMedia, prefs.mutedKeywords, prefs.mutedHashtags, prefs.sortOverride, query, profiles]);


  if (!user) return null;
  if (user.isGuest) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
        <div className="max-w-sm rounded-3xl border border-border bg-card p-8">
          <div className="text-3xl">👤</div>
          <h1 className="mt-3 text-lg font-bold">Feed isn't available for guests</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Guests can chat in the lobby only. Create an account to post, react, and follow friends in the feed.
          </p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4" /> Back to chat
          </Link>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
    { id: "foryou", label: "For You", icon: Sparkles },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "latest", label: "Latest", icon: Clock },
    { id: "friends", label: "Friends", icon: Users },
  ];

  const leftRailRef = useRef<HTMLDivElement | null>(null);
  const rightRailRef = useRef<HTMLDivElement | null>(null);

  // Smart sticky: rails scroll naturally with the page; when they're taller
  // than the viewport, the bottom pins on scroll-down and the top pins on
  // scroll-up (Twitter/Facebook-style behavior).
  useEffect(() => {
    const HEADER = 64;
    const GAP = 8;
    let lastY = window.scrollY;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      const dir = y > lastY ? "down" : y < lastY ? "up" : null;
      const vh = window.innerHeight;

      for (const el of [leftRailRef.current, rightRailRef.current]) {
        if (!el) continue;
        const parent = el.parentElement; // aside
        if (!parent) continue;
        const h = el.offsetHeight;
        const fits = h + HEADER + GAP <= vh;

        if (fits) {
          el.style.position = "sticky";
          el.style.top = `${HEADER + GAP}px`;
          el.style.transform = "";
          continue;
        }

        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const currentOffset = elRect.top - parentRect.top; // current translate within parent

        if (dir === "down") {
          // pin bottom of rail to bottom of viewport
          const desiredTopVp = vh - h - GAP;
          const targetOffset = desiredTopVp - parentRect.top;
          const minOffset = HEADER + GAP - parentRect.top; // can't go above header
          const offset = Math.max(currentOffset, Math.min(targetOffset, parent.offsetHeight - h));
          // Use sticky if rail bottom is currently flush with viewport bottom
          if (elRect.bottom <= vh + 0.5) {
            el.style.position = "sticky";
            el.style.top = `${vh - h - GAP}px`;
            el.style.transform = "";
          } else {
            el.style.position = "relative";
            el.style.top = "0";
            el.style.transform = `translateY(${Math.max(0, Math.min(offset, parent.offsetHeight - h))}px)`;
            void minOffset;
          }
        } else if (dir === "up") {
          // pin top of rail to top under header
          if (elRect.top >= HEADER + GAP - 0.5) {
            el.style.position = "sticky";
            el.style.top = `${HEADER + GAP}px`;
            el.style.transform = "";
          } else {
            el.style.position = "relative";
            el.style.top = "0";
            el.style.transform = `translateY(${Math.max(0, currentOffset)}px)`;
          }
        }
      }
      lastY = y;
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [view, tab]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 lg:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-30 feed-glass border-b border-border">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-5">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <BrandMark
              slot="feed"
              alt="Logo"
              className="h-9 w-9 rounded-xl object-contain"
              fallback={<div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold shadow-[0_4px_14px_-4px_var(--primary-glow)]">P</div>}
            />
            <span className="hidden text-[17px] font-bold tracking-tight sm:inline">Palrgo</span>
          </Link>
          <div className="mx-auto hidden w-full max-w-md md:block">
            <div className="flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm text-muted-foreground ring-1 ring-border focus-within:ring-primary/40 transition">
              <span>🔎</span>
              <span>Search posts, people, hashtags…</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <FeedNotifications meId={meId} profiles={profiles} />
            <button
              onClick={() => setDmOpenKey(k => k + 1)}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent/30 transition"
              title="Messages"
              aria-label="Messages"
            >
              <MessageCircle className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={() => { setProfileUsername(user.username); setView("profile"); }}
              className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-accent/30 transition"
              title="My profile"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-bold ring-2 ring-card">
                {user.username.slice(0, 1).toUpperCase()}
              </div>
              <span className="hidden text-sm font-semibold sm:inline">{user.username}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1360px] gap-4 px-2 py-4 sm:px-4 lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:gap-6 lg:px-6">
        {/* Left rail */}
        <aside className="hidden lg:block">
          <div ref={leftRailRef} className="space-y-3 pr-1 will-change-transform">
            <nav className="feed-card p-2">
              <div className="feed-section-label">Feed</div>
              <SideItem active={view === "feed" && tab === "foryou"} onClick={() => { setView("feed"); setTab("foryou"); }} icon={Newspaper} label="For You" color="text-sky-400" />
              <SideItem active={view === "feed" && tab === "trending"} onClick={() => { setView("feed"); setTab("trending"); }} icon={Flame} label="Trending" color="text-orange-400" />
              <SideItem active={view === "feed" && tab === "friends"} onClick={() => { setView("feed"); setTab("friends"); }} icon={Users} label="Friends" color="text-emerald-400" />
              <SideItem active={view === "feed" && tab === "saved"} onClick={() => { setView("feed"); setTab("saved"); }} icon={Bookmark} label="Saved" color="text-amber-400" />
              <SideItem active={view === "feed" && tab === "notifications"} onClick={() => { setView("feed"); setTab("notifications"); }} icon={Bell} label="Notifications" color="text-rose-400" />

              <div className="feed-section-label">Create</div>
              <SideItem
                onClick={() => {
                  setView("feed");
                  setTimeout(() => {
                    const el = document.getElementById("story-tray");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    const addBtn = document.querySelector<HTMLButtonElement>("[data-story-add]");
                    addBtn?.click();
                  }, 50);
                }}
                icon={CirclePlus}
                label="Add Story"
                color="text-fuchsia-400"
              />
              <SideItem
                onClick={() => {
                  setView("feed");
                  setTimeout(() => {
                    const el = document.getElementById("story-tray");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                icon={Sparkles}
                label="Stories"
                color="text-violet-400"
              />

              <div className="feed-section-label">Explore</div>
              <SideLink to="/" iconSrc={chatroomIcon} label="Chatrooms" />
              <SideNavLink to="/reels" icon={Film} label="Reels" badge="Soon" color="text-pink-400" />
              <SideNavLink to="/pages" icon={FileText} label="Pages" badge="Soon" color="text-cyan-400" />
              <SideNavLink to="/groups" icon={Users2} label="Groups" badge="Soon" color="text-indigo-400" />
              <SideItem onClick={() => setView("findFriends")} active={view === "findFriends"} icon={Users} label="Find Friends" color="text-teal-400" />

              <div className="feed-section-label">Rewards</div>
              <SideItem onClick={() => setView("achievements")} active={view === "achievements"} icon={Award} label="Achievements" color="text-yellow-400" />
              <SideItem onClick={() => setView("leaderboard")} active={view === "leaderboard"} icon={Trophy} label="Leaderboard" color="text-amber-400" />
              <SideItem onClick={() => setView("dailyChest")} active={view === "dailyChest"} icon={Gift} label="Daily Chest" color="text-rose-400" />
              <SideItem onClick={() => setView("spin")} active={view === "spin"} icon={Sparkles} label="Daily Spin" color="text-violet-400" />
              <SideItem onClick={() => setView("shop")} active={view === "shop"} icon={Coins} label="Shop" color="text-emerald-400" />

              <div className="feed-section-label">Account</div>
              <SideItem
                active={view === "profile"}
                onClick={() => { setProfileUsername(user.username); setView("profile"); }}
                icon={UserCircle}
                label="My Profile"
                color="text-primary"
              />
              <SideItem onClick={() => setView("account")} active={view === "account"} icon={Settings} label="Settings" color="text-slate-400" />
            </nav>
            <Suspense fallback={<RewardsWidgetSkeleton />}>
              <RewardsWidget
                meId={meId}
                onOpenChest={() => setView("dailyChest")}
                onOpenSpin={() => setView("spin")}
                onOpenShop={() => setView("shop")}
              />
            </Suspense>
            <FriendsListCard
              friendIds={friendIds}
              profiles={profiles}
              onChat={() => setDmOpenKey(k => k + 1)}
            />
          </div>
        </aside>


        {/* Center */}
        <main className="min-w-0 mx-auto w-full max-w-[680px]">
          {view === "account" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><AccountPanel /></Suspense></div>
          ) : view === "settings" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><FeedSettingsPanel /></Suspense></div>
          ) : view === "achievements" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><AchievementsPanel /></Suspense></div>
          ) : view === "leaderboard" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><LeaderboardPanel /></Suspense></div>
          ) : view === "findFriends" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><FindFriendsPanel /></Suspense></div>
          ) : view === "dailyChest" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><DailyChestPanel onBack={() => setView("feed")} /></Suspense></div>
          ) : view === "spin" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><SpinWheelPanel onBack={() => setView("feed")} /></Suspense></div>
          ) : view === "shop" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><ShopPanel onBack={() => setView("feed")} /></Suspense></div>
          ) : view === "profile" ? (
            <div className="feed-card p-5"><Suspense fallback={<PanelFallback />}><ProfilePanel username={profileUsername} onBack={() => setView("feed")} /></Suspense></div>
          ) : (
            <>
              <div className="mb-4 space-y-3 lg:hidden">
                <Suspense fallback={<RewardsWidgetSkeleton />}>
                  <RewardsWidget
                    meId={meId}
                    onOpenChest={() => setView("dailyChest")}
                    onOpenSpin={() => setView("spin")}
                    onOpenShop={() => setView("shop")}
                  />
                </Suspense>
                <DailyChallengesWidget meId={meId} />
              </div>
              <StoryTray />
              <div className="feed-card mt-4">
                <Composer authorId={meId} onPosted={loadPosts} />
              </div>

              <div className="mt-4 flex gap-1 overflow-x-auto rounded-full feed-card p-1.5 feed-scrollbar-hide">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`feed-pill-tab flex-1 ${active ? "feed-pill-tab-active" : ""}`}
                    >
                      <Icon className="h-4 w-4" /> {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-4">
                {tab === "saved" ? (
                  <div className="feed-card p-10 text-center">
                    <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-base font-semibold">No saved posts yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Bookmark posts from the feed to find them here later.</p>
                  </div>
                ) : tab === "notifications" ? (
                  <div className="feed-card p-10 text-center">
                    <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-base font-semibold">Notifications</p>
                    <p className="mt-1 text-sm text-muted-foreground">Tap the bell in the top bar to view your latest activity.</p>
                  </div>
                ) : (<>
                {loading && Array.from({ length: 3 }).map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
                {!loading && filtered.length === 0 && (
                  <div className="feed-card p-10 text-center">
                    <p className="text-sm text-muted-foreground">No posts yet. Be the first to share something!</p>
                  </div>
                )}
                {!loading && filtered.map((post) => (
                  <PostCard key={post.id} post={post} profiles={profiles} meId={meId} />
                ))}
                </>)}
              </div>

            </>
          )}
        </main>

        {/* Right rail */}
        <aside className="hidden lg:block">
          <div ref={rightRailRef} className="space-y-4 pl-1 will-change-transform">
            <BoobubbleAssistantWidget />
            <MissionsPanel />
            <DailyChallengesWidget meId={meId} />
            <ConfessionsFeedWidget />
            <ActivePollsWidget />
            <ChatroomOnlineWidget />
            <BirthdaysWidget />
            <FriendsWidget meId={meId} profiles={profiles} />
            <HashtagsWidget />
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-end feed-glass border-t border-border lg:hidden pb-[env(safe-area-inset-bottom)]">
        <button onClick={() => setView("feed")} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${view === "feed" ? "text-primary" : "text-muted-foreground"}`}><Sparkles className="h-5 w-5" /> Feed</button>
        <Link to="/" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground"><img src={chatroomIcon} alt="Chatrooms" className="h-5 w-5 rounded-full bg-white object-contain p-0.5" /> Rooms</Link>
        <div className="flex flex-1 justify-center">
          <button
            onClick={() => {
              setView("feed");
              setTimeout(() => {
                const ta = document.querySelector<HTMLTextAreaElement>('textarea[placeholder^="What\u2019s on your mind"], textarea[placeholder^="What\'s on your mind"]');
                ta?.focus();
                ta?.click();
                ta?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 50);
            }}
            aria-label="Create post"
            className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_10px_24px_-8px_var(--primary-glow,theme(colors.primary.DEFAULT))] ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>
        <button onClick={() => setView("account")} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${view === "account" ? "text-primary" : "text-muted-foreground"}`}><Settings className="h-5 w-5" /> Settings</button>
        <button onClick={() => { setProfileUsername(user.username); setView("profile"); }} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${view === "profile" ? "text-primary" : "text-muted-foreground"}`}><UserCircle className="h-5 w-5" /> Me</button>
      </nav>

      {/* Mobile quick-actions speed dial (left-bottom, opposite the theme toggle) */}
      <MobileSpeedDial
        open={fabOpen}
        onToggle={() => setFabOpen(o => !o)}
        onClose={() => setFabOpen(false)}
        actions={[
          { label: "Add Story", icon: CirclePlus, color: "from-fuchsia-500 to-pink-500", onClick: () => {
              setView("feed");
              setTimeout(() => {
                document.getElementById("story-tray")?.scrollIntoView({ behavior: "smooth", block: "center" });
                document.querySelector<HTMLButtonElement>("[data-story-add]")?.click();
              }, 60);
            } },
          { label: "Find Friends", icon: UserPlus, color: "from-teal-500 to-emerald-500", onClick: () => setView("findFriends") },
          { label: "Messages", icon: MessageCircle, color: "from-sky-500 to-indigo-500", onClick: () => setDmOpenKey(k => k + 1) },
          { label: "Notifications", icon: Bell, color: "from-rose-500 to-red-500", onClick: () => { setView("feed"); setTab("notifications"); } },
          { label: "Achievements", icon: Award, color: "from-yellow-500 to-amber-500", onClick: () => setView("achievements") },
          { label: "Leaderboard", icon: Trophy, color: "from-amber-500 to-orange-500", onClick: () => setView("leaderboard") },
          { label: "Daily Chest", icon: Gift, color: "from-rose-500 to-fuchsia-500", onClick: () => setView("dailyChest") },
          { label: "Daily Spin", icon: Sparkles, color: "from-violet-500 to-purple-500", onClick: () => setView("spin") },
          { label: "Shop", icon: Coins, color: "from-emerald-500 to-green-500", onClick: () => setView("shop") },
        ]}
        extraActions={[
          { label: "Create Post", icon: Plus, color: "from-primary to-primary/70", onClick: focusComposer },
          { label: "Public Chat", icon: Users, color: "from-sky-500 to-cyan-500", onClick: () => navigate({ to: "/" }) },
          { label: "Private Chat", icon: MessageCircle, color: "from-indigo-500 to-violet-500", onClick: () => setDmOpenKey(k => k + 1) },
        ]}
      />




      {dmOpenKey > 0 && (
        <Suspense fallback={null}>
          <FeedDMDock key={dmOpenKey} meId={meId} profiles={profiles} initialOpen={true} />
        </Suspense>
      )}
    </div>
  );
}


function FriendsListCard({ friendIds, profiles, onChat }: { friendIds: Set<string>; profiles: Record<string, import("@/lib/chat-types").User>; onChat: () => void }) {
  const { startDM } = useChat();
  const list = Array.from(friendIds).map(id => profiles[id]).filter(Boolean) as import("@/lib/chat-types").User[];
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm border border-border">
      <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Friends ({list.length})</div>
      {list.length === 0 ? (
        <p className="px-1 py-2 text-xs text-muted-foreground">No friends yet.</p>
      ) : (
        <div className="space-y-0.5">
          {list.slice(0, 8).map(u => (
            <button
              key={u.id}
              onClick={() => { startDM(u.id); onChat(); }}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-accent"
            >
              <Avatar user={u} size={28} />
              <span className="flex-1 truncate text-sm">{u.name}</span>
              <span className={`h-2 w-2 rounded-full ${u.status === "online" ? "bg-green-500" : "bg-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SideItem({ icon: Icon, label, active, onClick, color }: { icon: typeof Home; label: string; active?: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`feed-side-item ${active ? "feed-side-item-active" : ""}`}
    >
      <span className={`feed-icon-chip ${color ?? "text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function SideLink({ to, iconSrc, label }: { to: string; iconSrc: string; label: string }) {
  return (
    <Link to={to} className="feed-side-item">
      <span className="feed-icon-chip text-primary">
        <img src={iconSrc} alt="" className="h-4 w-4 rounded-full bg-white object-contain p-0.5" />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SideNavLink({ to, icon: Icon, label, badge, color }: { to: string; icon: typeof Home; label: string; badge?: string; color?: string }) {
  return (
    <Link to={to} className="feed-side-item">
      <span className={`feed-icon-chip ${color ?? "text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
      {badge && <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">{badge}</span>}
    </Link>
  );
}




function NavLink({ to, icon: Icon, label, active }: { to: string; icon: typeof Home; label: string; active?: boolean }) {
  return (
    <Link to={to} className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function MobileNav({ to, params, icon: Icon, label, active }: { to: string; params?: Record<string, string>; icon: typeof Home; label: string; active?: boolean }) {
  return (
    <Link to={to} params={params as never} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
      <Icon className="h-5 w-5" /> {label}
    </Link>
  );
}

type SpeedDialAction = { label: string; icon: typeof Home; color: string; onClick: () => void };

function MobileSpeedDial({ open, onToggle, onClose, actions, extraActions = [] }: { open: boolean; onToggle: () => void; onClose: () => void; actions: SpeedDialAction[]; extraActions?: SpeedDialAction[] }) {
  const [mode, setMode] = useState<"primary" | "extra">("primary");
  const longPressFired = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const startPress = () => {
    longPressFired.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      longPressFired.current = true;
      setMode("extra");
      if (!open) onToggle();
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.(15); } catch { /* ignore */ }
      }
    }, 450);
  };

  const endPress = () => clearTimer();

  const handleClick = () => {
    if (longPressFired.current) { longPressFired.current = false; return; }
    if (open && mode === "extra") { setMode("primary"); return; }
    setMode("primary");
    onToggle();
  };

  const closeAll = () => { setMode("primary"); onClose(); };
  const list = mode === "extra" ? extraActions : actions;
  const showingExtra = mode === "extra" && open;

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeAll}
          className="fixed inset-0 z-[55] bg-background/60 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      {/* Action sheet */}
      <div
        className={`fixed left-3 z-[58] flex flex-col-reverse items-start gap-2 transition-all duration-200 ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"}`}
        style={{ bottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}
      >
        {showingExtra && (
          <div className="ml-1 mb-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Quick Shortcuts</div>
        )}
        {list.map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={() => { a.onClick(); closeAll(); }}
              style={{ transitionDelay: open ? `${i * 25}ms` : "0ms" }}
              className="group flex items-center gap-2.5 rounded-full border border-border bg-card/95 pl-2 pr-4 py-1.5 shadow-lg backdrop-blur transition-all hover:scale-[1.03] active:scale-95"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${a.color} text-white shadow-md`}>
                <Icon className="h-4.5 w-4.5" strokeWidth={2.25} />
              </span>
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Trigger FAB — tap toggles main menu, long-press opens extra shortcuts */}
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        onPointerCancel={endPress}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={open ? "Close quick menu" : "Open quick menu (long-press for shortcuts)"}
        aria-expanded={open}
        className={`fixed left-4 z-[60] grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${showingExtra ? "from-fuchsia-500 to-violet-500" : "from-primary to-primary/70"} text-primary-foreground shadow-[0_10px_24px_-8px_var(--primary-glow)] ring-4 ring-background transition-all active:scale-90 select-none touch-none`}
        style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
      >
        <span className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}>
          {open ? <X className="h-5 w-5" strokeWidth={2.5} /> : <Menu className="h-5 w-5" strokeWidth={2.5} />}
        </span>
      </button>
    </div>
  );
}


