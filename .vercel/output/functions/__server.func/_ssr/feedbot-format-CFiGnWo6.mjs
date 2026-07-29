function siteUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path;
}
function formatFeedbotEvent(ev) {
  const p = ev.payload || {};
  const link = siteUrl(ev.target_url);
  const img = ev.image_url;
  switch (ev.category) {
    case "feed_post": {
      const user = p.username || "Someone";
      const text = p.text || "";
      const hasImage = Boolean(p.has_image);
      const snippet = text ? `"${text.slice(0, 160)}${text.length > 160 ? "…" : ""}"` : "";
      return {
        text: `📝 ${user} posted a new feed.
${snippet}
${hasImage ? "🖼 Preview available\n" : ""}🔗 ${link}`,
        attachmentUrl: img
      };
    }
    case "profile_avatar":
      return {
        text: `📸 ${p.username ?? "A member"} updated their profile picture.
🔗 ${link}`,
        attachmentUrl: img
      };
    case "profile_cover":
      return {
        text: `🖼 ${p.username ?? "A member"} updated their cover photo.
🔗 ${link}`,
        attachmentUrl: img
      };
    case "profile_bio":
      return {
        text: `✍️ ${p.username ?? "A member"} updated their bio.
"${p.bio ?? ""}"
🔗 ${link}`,
        attachmentUrl: null
      };
    case "new_member":
      return {
        text: `🎉 Welcome ${p.username ?? "a new member"} to the community!
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_started":
      return {
        text: `🏆 New competition started: ${p.name ?? ""}
Vote now and support your favourite!
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_vote":
      return {
        text: `🗳 New vote in ${p.name ?? "a competition"} — check the leaderboard.
🔗 ${link}`,
        attachmentUrl: null
      };
    case "competition_winner":
      return {
        text: `🥇 Winners announced for ${p.name ?? "the competition"}!
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_published":
      return {
        text: `📣 New competition announced: ${p.name ?? ""}
Get ready to compete and vote.
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_registration_open":
      return {
        text: `📝 Registration is OPEN for ${p.name ?? "a competition"}.
Join now!
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_registration_close":
      return {
        text: `🔒 Registration closed for ${p.name ?? "the competition"}. Voting is starting!
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_ending":
      return {
        text: `⏳ ${p.name ?? "The competition"} ends soon — last chance to vote!
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_ended":
      return {
        text: `🏁 Voting closed for ${p.name ?? "the competition"}. Winners coming up!
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_featured":
      return {
        text: `⭐ Featured competition: ${p.name ?? ""}
Don't miss this one.
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_trending":
      return {
        text: `🔥 Trending now: ${p.name ?? "a competition"} — activity spiking!
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_vote_milestone":
      return {
        text: `🎯 ${p.name ?? "A competition"} just crossed ${p.milestone ?? "?"} votes! Total: ${p.total_votes ?? "?"}
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_leader_change":
      return {
        text: `👑 New leader in ${p.name ?? "a competition"}: ${p.leader ?? "?"} with ${p.votes ?? 0} votes.
🔗 ${link}`,
        attachmentUrl: img
      };
    case "competition_nominee_joined":
      return {
        text: `🙋 ${p.username ?? "A new nominee"} joined ${p.name ?? "the competition"}.
🔗 ${link}`,
        attachmentUrl: img
      };
    case "radio_live":
      return {
        text: `🎙 ${p.host ?? "The RJ"} is now LIVE on Radio.
🔗 ${link}`,
        attachmentUrl: null
      };
    case "chatroom_created":
      return {
        text: `💬 New chatroom created: ${p.name ?? ""}
Join the conversation.
🔗 ${link}`,
        attachmentUrl: null
      };
    case "level_up":
      return {
        text: `🔥 ${p.username ?? "A member"} reached Level ${p.level ?? "?"}.
Congratulations!`,
        attachmentUrl: null
      };
    default:
      return {
        text: `📢 ${ev.kind.replace(/_/g, " ")}`,
        attachmentUrl: img
      };
  }
}
const CATEGORY_LABELS = {
  feed_post: "New feed post",
  profile_avatar: "Profile picture updated",
  profile_cover: "Cover photo updated",
  profile_bio: "Bio updated",
  new_member: "New member joined",
  competition_published: "Competition published",
  competition_registration_open: "Registration opens",
  competition_registration_close: "Registration closes",
  competition_started: "Competition starts",
  competition_ending: "Competition ending soon",
  competition_ended: "Competition ends",
  competition_vote: "Recent vote activity",
  competition_vote_milestone: "Vote milestone (100/500/1k/5k/10k)",
  competition_leader_change: "Leader change (rate-limited)",
  competition_nominee_joined: "Nominee joined",
  competition_featured: "Competition featured",
  competition_trending: "Competition trending",
  competition_winner: "Winner announced",
  radio_live: "Radio live",
  chatroom_created: "New chatroom created",
  level_up: "Level up / XP milestone",
  daily_summary: "Daily AI summary (21:00 IST)"
};
const COMPETITION_CATEGORY_KEYS = [
  "competition_published",
  "competition_registration_open",
  "competition_registration_close",
  "competition_started",
  "competition_ending",
  "competition_ended",
  "competition_vote",
  "competition_vote_milestone",
  "competition_leader_change",
  "competition_nominee_joined",
  "competition_featured",
  "competition_trending",
  "competition_winner"
];
export {
  COMPETITION_CATEGORY_KEYS as C,
  CATEGORY_LABELS as a,
  formatFeedbotEvent as f
};
