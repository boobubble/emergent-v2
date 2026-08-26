import { useEffect } from "react";
import { scheduleIdle } from "@/lib/schedule-idle";
import interCss from "@/styles/inter-latin.css?url";

/**
 * Inter is not on the guest H1 critical path. First paint uses the system
 * stack in --font-sans; the self-hosted Inter stylesheet is injected after
 * idle so Google Fonts is never requested.
 */
export function DeferredInterFont() {
  useEffect(() => {
    if (document.querySelector(`link[data-yaarzo-inter="1"]`)) return;
    const cancel = scheduleIdle(() => {
      if (document.querySelector(`link[data-yaarzo-inter="1"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = interCss;
      link.dataset.yaarzoInter = "1";
      document.head.appendChild(link);
    }, 2500);
    return cancel;
  }, []);
  return null;
}
