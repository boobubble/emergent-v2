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
  ".welcome-root header .ml-auto{margin-left:auto;display:flex;align-items:center;gap:.5rem}",
  ".welcome-root main>section:first-child>div{max-width:80rem;margin:0 auto;padding:2rem 1rem 3rem;display:grid;gap:2.5rem}",
  ".welcome-root h1{margin:.5rem 0 0;font-size:32px;font-weight:900;line-height:1.08;letter-spacing:-.025em;color:#fff}",
  ".welcome-root h1>span{-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}",
  ".welcome-light{background:#f5f6fb;color:#0b0b1a}",
  ".welcome-light h1{color:#0b0b1a}",
  ".welcome-light header,.welcome-light .welcome-mobile-nav{background:#f5f6fb;border-color:rgba(11,11,26,.1)}",
  ".welcome-aurora{position:fixed;inset:0;z-index:-1;pointer-events:none}",
  ".welcome-orb{position:absolute;border-radius:9999px;pointer-events:none}",
].join("");
