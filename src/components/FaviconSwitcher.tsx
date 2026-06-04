import { useEffect } from "react";
import { useChat } from "@/lib/chat-store";
import { useBrandingMap } from "@/components/BrandMark";

const DEFAULT_BLUE = "/favicon-blue.png";
const DEFAULT_RED = "/favicon-red.png";

function setFavicon(href: string) {
  if (typeof document === "undefined") return;
  const links = document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
  links.forEach(l => l.parentNode?.removeChild(l));
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = href;
  document.head.appendChild(link);
}

export function FaviconSwitcher() {
  const { dmUnreadCount, state } = useChat();
  const branding = useBrandingMap();
  const activeId = state.activeChannel;

  useEffect(() => {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const roomFav = activeId && branding.rooms?.[activeId]
      ? (isDark ? branding.rooms[activeId].favicon_dark : branding.rooms[activeId].favicon_light)
        || branding.rooms[activeId].favicon_light
        || branding.rooms[activeId].favicon_dark
      : undefined;
    const globalFav = (isDark ? branding.favicon_dark : branding.favicon_light)
      || branding.favicon_light
      || branding.favicon_dark;
    if (dmUnreadCount > 0) {
      setFavicon(DEFAULT_RED);
    } else {
      setFavicon(roomFav || globalFav || DEFAULT_BLUE);
    }
  }, [dmUnreadCount, activeId, branding]);

  return null;
}
