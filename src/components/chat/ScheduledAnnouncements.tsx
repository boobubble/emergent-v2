import { useEffect, useRef } from "react";
import { useAppSettings } from "@/lib/app-settings";
import { useChat } from "@/lib/chat-store";

export interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
  intervalMinutes: number;
  enabled: boolean;
}

export interface AnnouncementsConfig {
  enabled: boolean;
  items: AnnouncementItem[];
}

export const ANNOUNCEMENTS_KEY = "chat_announcements";

export const DEFAULT_ANNOUNCEMENTS: AnnouncementsConfig = {
  enabled: false,
  items: [
    { id: "a1", text: "📢 Welcome to the community! Check out our latest updates.", link: "", intervalMinutes: 30, enabled: true },
    { id: "a2", text: "🎮 Try our games — type !help to see commands.", link: "", intervalMinutes: 45, enabled: true },
    { id: "a3", text: "💬 Invite friends and earn rewards!", link: "", intervalMinutes: 60, enabled: false },
    { id: "a4", text: "🏆 Check the leaderboard — climb the ranks today.", link: "", intervalMinutes: 90, enabled: false },
    { id: "a5", text: "", link: "", intervalMinutes: 60, enabled: false },
  ],
};

export function ScheduledAnnouncementsRunner() {
  const { raw } = useAppSettings();
  const { state, pushSystem } = useChat();
  const cfg = (raw[ANNOUNCEMENTS_KEY] as AnnouncementsConfig | undefined) || DEFAULT_ANNOUNCEMENTS;
  const activeChannelRef = useRef(state.activeChannel);
  activeChannelRef.current = state.activeChannel;

  useEffect(() => {
    if (!cfg.enabled) return;
    const timers: ReturnType<typeof setInterval>[] = [];
    for (const item of cfg.items) {
      if (!item.enabled || !item.text.trim() || item.intervalMinutes <= 0) continue;
      const ms = Math.max(1, item.intervalMinutes) * 60_000;
      const t = setInterval(() => {
        const ch = activeChannelRef.current;
        if (!ch || ch.startsWith("dm:")) return;
        const body = item.link ? `${item.text} ${item.link}` : item.text;
        pushSystem(ch, `📣 ${body}`);
      }, ms);
      timers.push(t);
    }
    return () => { timers.forEach(clearInterval); };
  }, [cfg.enabled, JSON.stringify(cfg.items), pushSystem]);

  return null;
}
