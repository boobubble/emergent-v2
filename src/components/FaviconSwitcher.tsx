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
  const { dmUnreadCount } = useChat();
  const branding = useBrandingMap();

  useEffect(() => {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const themedFavicon = (isDark ? branding.favicon_dark : branding.favicon_light)
      || branding.favicon_light
      || branding.favicon_dark;
    if (dmUnreadCount > 0) {
      setFavicon(DEFAULT_RED);
    } else {
      setFavicon(themedFavicon || DEFAULT_BLUE);
    }
  }, [dmUnreadCount, branding.favicon_light, branding.favicon_dark]);

  return null;
}
