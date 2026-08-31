import { readFileSync, writeFileSync } from "node:fs";

const orig = readFileSync("src/styles.css", "utf8");
const lines = orig.split(/\r?\n/);
const idx = lines.findIndex((l) => l.includes("===== Feed Premium UI ====="));
if (idx < 0) throw new Error("split marker missing");
const head = lines.slice(0, idx);
const tail = lines.slice(idx);
const heroStart = tail.findIndex((l) => l.includes("===== Hero homepage light-mode overrides ====="));
const hubStart = tail.findIndex((l) => l.includes("/* Community Hub */"));
if (heroStart < 0 || hubStart < 0) throw new Error("hero/hub markers missing");
const heroBlock = tail.slice(heroStart, hubStart).join("\n").trim();
const rest = [...tail.slice(0, heroStart), ...tail.slice(hubStart)].join("\n");

const sourceNots = [
  "./components/chat",
  "./components/feed",
  "./components/games",
  "./components/admin",
  "./components/broadcaster",
  "./components/competitions",
  "./components/cosmetics",
  "./components/mehfil",
  "./components/moderation",
  "./components/journey",
  "./components/discovery",
  "./components/profile",
  "./components/subscription",
  "./components/community",
]
  .map((p) => `@source not "${p}";`)
  .join("\n");

const newHead = head
  .join("\n")
  .replace('@import "tw-animate-css";\n\n', "")
  .replace('@source "../src";', `@source "../src";\n${sourceNots}`);

const styles = `${newHead.trimEnd()}\n\n${heroBlock}\n`;
writeFileSync("src/styles.css", styles);

const appSources = [
  "../components/chat",
  "../components/feed",
  "../components/games",
  "../components/admin",
  "../components/broadcaster",
  "../components/competitions",
  "../components/cosmetics",
  "../components/mehfil",
  "../components/moderation",
  "../components/journey",
  "../components/discovery",
  "../components/profile",
  "../components/subscription",
  "../components/community",
]
  .map((p) => `@source "${p}";`)
  .join("\n");

const app = `/* Route-specific surfaces: chat, feed, games, admin, CMS, hub.
   Loaded by app shells / CMS / heropage — not on guest / first paint. */
@import "tailwindcss/utilities" layer(utilities) source(none);
${appSources}
@import "tw-animate-css";

${rest.trimEnd()}
`;
writeFileSync("src/styles/app-surfaces.css", app);
console.log("styles.css bytes", styles.length, "app-surfaces bytes", app.length);
