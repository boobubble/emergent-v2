import { r as reactExports } from "../_libs/react.mjs";
import { u as useAppSettings, g as useChat } from "./router-CYWPFaDK.mjs";
const ANNOUNCEMENTS_KEY = "chat_announcements";
const DEFAULT_ANNOUNCEMENTS = {
  enabled: false,
  items: [
    { id: "a1", text: "📢 Welcome to the community! Check out our latest updates.", link: "", intervalMinutes: 30, enabled: true },
    { id: "a2", text: "🎮 Try our games — type !help to see commands.", link: "", intervalMinutes: 45, enabled: true },
    { id: "a3", text: "💬 Invite friends and earn rewards!", link: "", intervalMinutes: 60, enabled: false },
    { id: "a4", text: "🏆 Check the leaderboard — climb the ranks today.", link: "", intervalMinutes: 90, enabled: false },
    { id: "a5", text: "", link: "", intervalMinutes: 60, enabled: false }
  ]
};
function ScheduledAnnouncementsRunner() {
  const { raw } = useAppSettings();
  const { state, pushSystem } = useChat();
  const cfg = raw[ANNOUNCEMENTS_KEY] || DEFAULT_ANNOUNCEMENTS;
  const activeChannelRef = reactExports.useRef(state.activeChannel);
  activeChannelRef.current = state.activeChannel;
  reactExports.useEffect(() => {
    if (!cfg.enabled) return;
    const timers = [];
    for (const item of cfg.items) {
      if (!item.enabled || !item.text.trim() || item.intervalMinutes <= 0) continue;
      const ms = Math.max(1, item.intervalMinutes) * 6e4;
      const t = setInterval(() => {
        const ch = activeChannelRef.current;
        if (!ch || ch.startsWith("dm:")) return;
        const body = item.link ? `${item.text} ${item.link}` : item.text;
        pushSystem(ch, `📣 ${body}`);
      }, ms);
      timers.push(t);
    }
    return () => {
      timers.forEach(clearInterval);
    };
  }, [cfg.enabled, JSON.stringify(cfg.items), pushSystem]);
  return null;
}
export {
  ANNOUNCEMENTS_KEY as A,
  DEFAULT_ANNOUNCEMENTS as D,
  ScheduledAnnouncementsRunner as S
};
