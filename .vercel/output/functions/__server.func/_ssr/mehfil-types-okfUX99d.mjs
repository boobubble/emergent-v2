const WRITER_RANK_LABEL = {
  fresh_writer: "Fresh Writer",
  rising_poet: "Rising Poet",
  poet: "Poet",
  master_poet: "Master Poet",
  legend_poet: "Legend Poet",
  hall_of_fame: "Hall of Fame"
};
const WRITER_RANK_COLOR = {
  fresh_writer: "#94a3b8",
  rising_poet: "#22c55e",
  poet: "#0ea5e9",
  master_poet: "#8b5cf6",
  legend_poet: "#f59e0b",
  hall_of_fame: "#ef4444"
};
const WRITER_RANK_ICON = {
  fresh_writer: "✍️",
  rising_poet: "🌱",
  poet: "📜",
  master_poet: "🎖️",
  legend_poet: "👑",
  hall_of_fame: "🏆"
};
const MEHFIL_REACTIONS = [
  { type: "love", emoji: "❤️", label: "Dil Chhoo Liya" },
  { type: "haha", emoji: "👏", label: "Wah Wah" },
  { type: "angry", emoji: "🥺", label: "Emotional" },
  // repurposed slot
  { type: "fire", emoji: "🔥", label: "Outstanding" },
  { type: "like", emoji: "🌹", label: "Beautiful" },
  { type: "wow", emoji: "✨", label: "Masterpiece" }
];
const MEHFIL_SETTINGS_DEFAULTS = {
  enabled: true,
  battles_enabled: true,
  upvotes_enabled: true,
  comments_enabled: true,
  reactions_enabled: true,
  shares_enabled: true,
  ai_assist_enabled: true,
  auto_publish_winners: true,
  trending_widget_frequency: 5,
  battle_auto_enroll: false,
  default_language: "en",
  module_name: "Poetry Hub",
  following_enabled: true,
  drafts_enabled: true,
  scheduled_publishing_enabled: true,
  collections_enabled: true,
  daily_prompt_enabled: true,
  writer_stats_enabled: true,
  reading_progress_enabled: true
};
function slugifyTitle(title) {
  return (title || "poem").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "poem";
}
function poemPreview(body, max = 180) {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/[,.\s]+\S*$/, "") + "…";
}
export {
  MEHFIL_SETTINGS_DEFAULTS as M,
  WRITER_RANK_LABEL as W,
  WRITER_RANK_COLOR as a,
  WRITER_RANK_ICON as b,
  MEHFIL_REACTIONS as c,
  poemPreview as p,
  slugifyTitle as s
};
