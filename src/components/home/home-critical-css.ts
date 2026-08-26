/**
 * Above-fold guest homepage CSS inlined in <head> so the H1 can paint
 * without waiting on the global Tailwind stylesheet.
 * Scoped to .welcome-root so other routes are unaffected.
 */
export const HOME_CRITICAL_CSS = [
  "html,body{margin:0;background:#070713}",
  ".welcome-root{min-height:100vh;background:#070713;color:#fff;overflow-x:hidden;position:relative;-webkit-font-smoothing:antialiased;font-family:ui-sans-serif,system-ui,sans-serif}",
  ".welcome-root a{color:inherit;text-decoration:none}",
  ".welcome-root button{font:inherit;color:inherit;cursor:pointer}",
  ".welcome-root header{position:sticky;top:0;z-index:40;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(7,7,19,.95)}",
  ".welcome-root header>div{display:flex;align-items:center;gap:1rem;max-width:80rem;margin:0 auto;padding:.75rem 1rem}",
  ".welcome-root h1{margin:.5rem 0 0;font-size:32px;font-weight:900;line-height:1.08;letter-spacing:-.025em}",
  ".welcome-aurora{position:fixed;inset:0;z-index:-1;pointer-events:none}",
  ".welcome-orb{position:absolute;border-radius:9999px;pointer-events:none}",
].join("");
