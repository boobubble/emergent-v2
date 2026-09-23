import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  isGuestProtectedNavPath,
  type ChatroomShellPanelId,
} from "@/lib/chatroom-shell-panel";
import { useAuthGate } from "@/lib/auth-gate";
import {
  Award,
  ChevronLeft,
  Gamepad2,
  Home,
  MessageSquare,
  MessageSquareHeart,
  Newspaper,
  PenLine,
  Radio,
  Search,
  Settings,
  Swords,
  Trophy,
  TrendingUp,
  UserPlus,
  Users,
  Bell,
} from "lucide-react";
import { BrandText } from "@/components/BrandMark";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useAppSettings } from "@/lib/app-settings";
import { useMehfilLabel } from "@/lib/use-mehfil-label";
import { useSocialGraphOptional } from "@/lib/use-social-graph";
import { useNotificationsOptional } from "@/lib/use-notifications";
import { Avatar } from "@/components/chat/Avatar";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { useCodyChatCommunity } from "./use-codychat-community";
import { CodyChatRadioWidget } from "./CodyChatRadioWidget";
import { openYaarzoDmInbox } from "@/lib/yaarzo-dm-events";
import type { LucideIcon } from "lucide-react";

function NavRow({
  to,
  search,
  icon: Icon,
  label,
  badge,
  badgeText,
  active,
  onNavigate,
  hidden,
  shellPanel,
  shellTab,
  onShellPanel,
  onCloseShellPanel,
  nativeCodyGuest,
  onCustomClick,
}: {
  to?: string;
  search?: Record<string, string>;
  icon: LucideIcon;
  label: string;
  badge?: number;
  badgeText?: string;
  active?: boolean;
  onNavigate?: () => void;
  hidden?: boolean;
  shellPanel?: ChatroomShellPanelId;
  shellTab?: string;
  onShellPanel?: (panel: ChatroomShellPanelId, tab?: string) => void;
  onCloseShellPanel?: () => void;
  nativeCodyGuest?: boolean;
  onCustomClick?: () => void;
}) {
  const { requireAuth } = useAuthGate();
  if (hidden) return null;
  const rowClass = cn("cody-nav-row", active && "cody-nav-row-active");
  const inner = (
    <>
      <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {badgeText ? (
        <span className="cody-nav-badge cody-nav-badge-live">{badgeText}</span>
      ) : null}
      {badge != null && badge > 0 ? (
        <span className="cody-nav-badge">{badge > 99 ? "99+" : badge}</span>
      ) : null}
    </>
  );

  if (onCustomClick) {
    return (
      <button
        type="button"
        className={rowClass}
        onClick={() => {
          requireAuth(() => {
            onCustomClick();
            onNavigate?.();
          });
        }}
      >
        {inner}
      </button>
    );
  }

  if (shellPanel && onShellPanel) {
    return (
      <button
        type="button"
        className={rowClass}
        onClick={() => {
          onShellPanel(shellPanel, shellTab);
          onNavigate?.();
        }}
      >
        {inner}
      </button>
    );
  }

  if (onCloseShellPanel && active) {
    return (
      <button
        type="button"
        className={rowClass}
        onClick={() => {
          onCloseShellPanel();
          onNavigate?.();
        }}
      >
        {inner}
      </button>
    );
  }

  if (!to) return null;

  if (nativeCodyGuest && isGuestProtectedNavPath(to)) {
    return (
      <button
        type="button"
        className={rowClass}
        onClick={() => {
          requireAuth();
          onNavigate?.();
        }}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link to={to} search={search} onClick={onNavigate} className={rowClass}>
      {inner}
    </Link>
  );
}

type NavItem = {
  to?: string;
  search?: Record<string, string>;
  icon: LucideIcon;
  label: string;
  badge?: number;
  badgeText?: string;
  active?: boolean;
  enabled?: boolean;
  shellPanel?: ChatroomShellPanelId;
  shellTab?: string;
  closeChatPanel?: boolean;
  onCustomClick?: () => void;
};

type CodyChatSidebarNavProps = {
  connected?: boolean;
  onClose?: () => void;
  onCollapse?: () => void;
  className?: string;
  shellPanel?: ChatroomShellPanelId;
  shellPanelTab?: string;
  onOpenShellPanel?: (panel: ChatroomShellPanelId, opts?: { tab?: string }) => void;
  onCloseShellPanel?: () => void;
  nativeCodyGuest?: boolean;
};

export function CodyChatSidebarNav({
  connected = false,
  onClose,
  onCollapse,
  className,
  shellPanel,
  shellPanelTab,
  onOpenShellPanel,
  onCloseShellPanel,
  nativeCodyGuest = false,
}: CodyChatSidebarNavProps) {
  const { requireAuth } = useAuthGate();
  const isPanelActive = (item: NavItem) => {
    if (item.closeChatPanel) return !shellPanel;
    if (!item.shellPanel) return Boolean(item.active);
    if (shellPanel !== item.shellPanel) return false;
    if (item.shellTab) return item.shellTab === shellPanelTab;
    return !shellPanelTab || shellPanelTab === "foryou";
  };
  const { user } = useAuth();
  const mehfilLabel = useMehfilLabel();
  const { raw } = useAppSettings();
  const modules = (raw as { modules?: { communities?: boolean } }).modules;
  const communitiesEnabled = modules?.communities !== false;

  const social = useSocialGraphOptional();
  const notifs = useNotificationsOptional();
  const { profiles } = useRemoteProfiles();
  const { enabledWidgets, liveCompetitions } = useCodyChatCommunity();
  const [search, setSearch] = useState("");

  const incomingFriendCount = useMemo(() => {
    if (!social?.meId) return 0;
    return social.friendships.filter(
      (f) => f.status === "pending" && f.receiver_id === social.meId,
    ).length;
  }, [social]);

  const selfUser = user ? profiles[user.id] : undefined;
  const q = search.trim().toLowerCase();

  const homeItems: NavItem[] = [
    { shellPanel: "home", icon: Home, label: "Home", enabled: true },
    { shellPanel: "feed", icon: Newspaper, label: "Feed", enabled: true },
    {
      shellPanel: "feed",
      shellTab: "trending",
      icon: TrendingUp,
      label: "Trending",
      enabled: true,
    },
    { shellPanel: "find-friends", icon: UserPlus, label: "Find Friends", enabled: true },
  ];

  const communityItems: NavItem[] = [
    {
      icon: MessageSquare,
      label: "Chatrooms",
      active: !shellPanel,
      closeChatPanel: true,
      enabled: true,
    },
    { shellPanel: "poetry", icon: PenLine, label: mehfilLabel, enabled: true },
    {
      shellPanel: "competitions",
      icon: Trophy,
      label: "Competitions",
      badgeText: liveCompetitions.length > 0 ? "Live" : undefined,
      enabled: true,
    },
    { shellPanel: "confessions", icon: MessageSquareHeart, label: "Confessions", enabled: true },
    { to: "/battle-hub", icon: Swords, label: "Live Arena", enabled: true },
    { to: "/leaderboard", icon: Award, label: "Leaderboard", enabled: true },
    { to: "/communities", icon: Users, label: "Communities", enabled: communitiesEnabled },
    { to: "/radio", icon: Radio, label: "Radio", enabled: true },
    { to: "/games", icon: Gamepad2, label: "Games", enabled: true },
  ];

  const socialItems: NavItem[] = [
    {
      shellPanel: "find-friends",
      shellTab: "requests",
      icon: Users,
      label: "Friend Requests",
      badge: incomingFriendCount || undefined,
      enabled: true,
    },
    {
      shellPanel: "feed",
      shellTab: "notifications",
      icon: Bell,
      label: "Notifications",
      badge: notifs?.unread,
      enabled: true,
    },
    {
      icon: MessageSquare,
      label: "Direct Messages",
      onCustomClick: openYaarzoDmInbox,
      enabled: true,
    },
  ];

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => {
      if (item.enabled === false) return false;
      if (!q) return true;
      return item.label.toLowerCase().includes(q);
    });

  const filteredHome = filterItems(homeItems);
  const filteredCommunity = filterItems(communityItems);
  const filteredSocial = filterItems(socialItems);

  return (
    <aside className={cn("flex h-full w-full min-w-0 shrink-0 flex-col", className)}>
      <div className="cody-sidebar-panel flex h-full min-h-0 flex-col overflow-hidden">
        <div className="relative shrink-0 border-b border-border/40">
          <div className="cody-brand-block">
            <div className="min-w-0 flex-1">
              <BrandText
                slot="chat"
                defaultText="Yaarzo"
                className="text-[14px] font-semibold tracking-tight"
                alwaysShow
              />
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                Chat · Connect · Belong
              </p>
              <span className="cody-status-pill">
                <span
                  className={cn("cody-status-dot", connected && "cody-status-dot-live")}
                  aria-hidden
                />
                {connected ? "Connected" : "Connecting…"}
              </span>
            </div>
            {onCollapse ? (
              <button
                type="button"
                onClick={onCollapse}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label="Collapse navigation"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="px-2 pb-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rooms, users, posts…"
                className="cody-sidebar-search h-8 pl-8 pr-12 text-xs"
                aria-label="Filter navigation"
              />
              <kbd className="cody-kbd-hint pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                Ctrl K
              </kbd>
            </div>
          </div>
        </div>

        <ScrollArea className="cody-scroll-area min-h-0 flex-1">
          {filteredHome.length > 0 ? (
            <div className="space-y-0.5 px-2 py-2">
              <p className="cody-section-label">Home</p>
              {filteredHome.map((item) => (
                <NavRow
                  key={`${item.label}-${item.shellPanel ?? item.to}`}
                  {...item}
                  active={isPanelActive(item)}
                  onNavigate={onClose}
                  onShellPanel={
                    onOpenShellPanel
                      ? (panel, tab) => onOpenShellPanel(panel, tab ? { tab } : undefined)
                      : undefined
                  }
                  onCloseShellPanel={item.closeChatPanel ? onCloseShellPanel : undefined}
                  nativeCodyGuest={nativeCodyGuest}
                />
              ))}
            </div>
          ) : null}

          {filteredCommunity.length > 0 ? (
            <div className="space-y-0.5 px-2 py-1">
              <p className="cody-section-label">Community</p>
              {filteredCommunity.map((item) => (
                <NavRow
                  key={`${item.label}-${item.shellPanel ?? item.to}`}
                  {...item}
                  active={isPanelActive(item)}
                  onNavigate={onClose}
                  onShellPanel={
                    onOpenShellPanel
                      ? (panel, tab) => onOpenShellPanel(panel, tab ? { tab } : undefined)
                      : undefined
                  }
                  onCloseShellPanel={item.closeChatPanel ? onCloseShellPanel : undefined}
                  nativeCodyGuest={nativeCodyGuest}
                />
              ))}
            </div>
          ) : null}

          {filteredSocial.length > 0 ? (
            <div className="space-y-0.5 px-2 pb-2">
              <p className="cody-section-label">Social</p>
              {filteredSocial.map((item) => (
                <NavRow
                  key={`${item.label}-${item.shellPanel ?? item.to}`}
                  {...item}
                  active={isPanelActive(item)}
                  onNavigate={onClose}
                  onShellPanel={
                    onOpenShellPanel
                      ? (panel, tab) => onOpenShellPanel(panel, tab ? { tab } : undefined)
                      : undefined
                  }
                  nativeCodyGuest={nativeCodyGuest}
                />
              ))}
            </div>
          ) : null}

          {q &&
          filteredHome.length === 0 &&
          filteredCommunity.length === 0 &&
          filteredSocial.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">No matches.</p>
          ) : null}
        </ScrollArea>

        {enabledWidgets.length > 0 ? (
          <div className="shrink-0 border-t border-border/40 px-2 py-2">
            <CodyChatRadioWidget widgets={enabledWidgets} compact />
          </div>
        ) : null}

        {user && selfUser ? (
          <div className="shrink-0 border-t border-border/40 px-2 py-2">
            <button
              type="button"
              onClick={() => {
                if (nativeCodyGuest) {
                  requireAuth();
                  return;
                }
                onOpenShellPanel?.("feed", { tab: "account" });
                onClose?.();
              }}
              className="cody-mini-profile w-full text-left"
            >
              <Avatar user={selfUser} size={36} square={false} />
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[12px] font-semibold">{selfUser.name}</span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  Lv {selfUser.level ?? 1}
                  {selfUser.status === "online" ? " · Online" : ""}
                </span>
              </span>
              <Settings className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
