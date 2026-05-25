import { useEffect } from "react";
import { useChat } from "@/lib/chat-store";

const BLUE = "/favicon-blue.png";
const RED = "/favicon-red.png";

function setFavicon(href: string) {
  if (typeof document === "undefined") return;
  const links = document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
  links.forEach(l => l.parentNode?.removeChild(l));
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = href;
  document.head.appendChild(link);
}

export function FaviconSwitcher() {
  const { dmUnreadCount } = useChat();
  useEffect(() => {
    setFavicon(dmUnreadCount > 0 ? RED : BLUE);
  }, [dmUnreadCount]);
  return null;
}
