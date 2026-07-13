// Dynamic OpenGraph / share card renderer for competitions.
// Returns a themed SVG (accepted by most modern crawlers, always renders in
// browsers) so we don't need to spin up a canvas / satori pipeline.
// Handles four variants via ?variant= query: competition | winner | nominee | hall-of-fame.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const W = 1200;
const H = 630;

function esc(s: string | null | undefined): string {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function fmtCountdown(endAt: string | null | undefined): string {
  if (!endAt) return "";
  const ms = new Date(endAt).getTime() - Date.now();
  if (ms <= 0) return "Voting closed";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `Ends in ${d}d ${h}h`;
  const m = Math.floor((ms % 3600000) / 60000);
  return `Ends in ${h}h ${m}m`;
}

function fmtNum(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

interface CardData {
  variant: string;
  title: string;
  subtitle: string;
  banner: string | null;
  stat1?: { label: string; value: string };
  stat2?: { label: string; value: string };
  stat3?: { label: string; value: string };
  badge?: string;
}

function render(data: CardData): string {
  const bannerLayer = data.banner
    ? `<image href="${esc(data.banner)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" opacity="0.35"/>`
    : "";
  const stats = [data.stat1, data.stat2, data.stat3].filter(Boolean) as Array<{
    label: string;
    value: string;
  }>;
  const statBoxes = stats
    .map((s, i) => {
      const x = 80 + i * 350;
      return `
        <g transform="translate(${x}, 470)">
          <rect width="310" height="100" rx="18" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)"/>
          <text x="24" y="42" fill="#e2e8f0" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500">${esc(s.label)}</text>
          <text x="24" y="82" fill="#fff" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="700">${esc(s.value)}</text>
        </g>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="60%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${bannerLayer}
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <g transform="translate(80, 80)">
    <rect width="180" height="40" rx="20" fill="#fbbf24"/>
    <text x="90" y="27" text-anchor="middle" fill="#0f172a" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700">${esc(data.badge ?? "COMPETITION")}</text>
  </g>
  <text x="80" y="230" fill="#fff" font-family="Inter, system-ui, sans-serif" font-size="64" font-weight="800">${esc(truncate(data.title, 34))}</text>
  <text x="80" y="290" fill="#cbd5e1" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="500">${esc(truncate(data.subtitle, 60))}</text>
  ${statBoxes}
  <text x="${W - 80}" y="${H - 40}" text-anchor="end" fill="rgba(255,255,255,0.6)" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="600">BooBubble</text>
</svg>`;
}

export const Route = createFileRoute("/api/public/og/competition/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const variant = url.searchParams.get("variant") ?? "competition";
        const { data: comp } = await supabaseAdmin
          .from("competitions")
          .select("id, name, description, banner_url, end_at, total_votes, total_participants, status")
          .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
          .maybeSingle();
        if (!comp) return new Response("Not found", { status: 404 });

        // Leading participant
        const { data: leader } = await supabaseAdmin
          .from("competition_participants")
          .select("vote_count, user_id")
          .eq("competition_id", comp.id)
          .eq("status", "approved")
          .order("vote_count", { ascending: false })
          .limit(1)
          .maybeSingle();
        let leaderName = "";
        if (leader?.user_id) {
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("username")
            .eq("id", leader.user_id)
            .maybeSingle();
          leaderName = prof?.username ?? "";
        }

        const isCompleted = comp.status === "completed";
        const badge =
          variant === "winner" || isCompleted
            ? "🏆 WINNER"
            : variant === "nominee"
              ? "🌟 NOMINEE"
              : variant === "hall-of-fame"
                ? "👑 HALL OF FAME"
                : "🏆 COMPETITION";

        const subtitle =
          variant === "winner"
            ? `Winner announced — ${leaderName || "See the results"}`
            : leaderName
              ? `Leading: ${leaderName}`
              : "Cast your vote and support your favourite";

        const data: CardData = {
          variant,
          title: comp.name,
          subtitle,
          banner: comp.banner_url,
          badge,
          stat1: { label: "Votes", value: fmtNum(comp.total_votes) },
          stat2: { label: "Nominees", value: fmtNum(comp.total_participants) },
          stat3: {
            label: isCompleted ? "Status" : "Countdown",
            value: isCompleted ? "Closed" : fmtCountdown(comp.end_at),
          },
        };

        return new Response(render(data), {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=120, s-maxage=300",
          },
        });
      },
    },
  },
});
