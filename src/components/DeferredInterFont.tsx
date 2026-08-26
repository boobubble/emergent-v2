import { useEffect } from "react";

const INTER_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap";

/**
 * Inter is not render-blocking. First paint uses the existing system stack in
 * --font-sans; Inter swaps in after the stylesheet arrives.
 */
export function DeferredInterFont() {
  useEffect(() => {
    if (document.querySelector(`link[href="${INTER_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = INTER_HREF;
    const id = window.requestAnimationFrame(() => {
      document.head.appendChild(link);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);
  return null;
}
