// FeedBot payload builders — pure functions, safe to import anywhere.
// Each builder takes a queued event and returns the message text + optional
// image URL that the dispatcher writes into the `messages` table.

export interface FeedbotEvent {
  id: string;
  kind: string;
  category: string;
  actor_id: string | null;
  payload: Record<string, unknown>;
  target_url: string | null;
  image_url: string | null;
  created_at: string;
}

export interface FormattedBotMessage {
  text: string;
  attachmentUrl: string | null;
}

function siteUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path;
}

export function formatFeedbotEvent(ev: FeedbotEvent): FormattedBotMessage {
  const p = ev.payload || {};
  const link = siteUrl(ev.target_url);
  const img = ev.image_url;

  switch (ev.category) {
    case "feed_post": {
      const user = (p.username as string) || "Someone";
      const text = (p.text as string) || "";
      const hasImage = Boolean(p.has_image);
      const snippet = text ? `"${text.slice(0, 160)}${text.length > 160 ? "…" : ""}"` : "";
      return {
        text: `📝 ${user} posted a new feed.\n${snippet}\n${hasImage ? "🖼 Preview available\n" : ""}🔗 ${link}`,
        attachmentUrl: img,
      };
    }
    case "profile_avatar":
      return {
        text: `📸 ${p.username ?? "A member"} updated their profile picture.\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "profile_cover":
      return {
        text: `🖼 ${p.username ?? "A member"} updated their cover photo.\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "profile_bio":
      return {
        text: `✍️ ${p.username ?? "A member"} updated their bio.\n"${(p.bio as string) ?? ""}"\n🔗 ${link}`,
        attachmentUrl: null,
      };
    case "new_member":
      return {
        text: `🎉 Welcome ${p.username ?? "a new member"} to the community!\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_started":
      return {
        text: `🏆 New competition started: ${p.name ?? ""}\nVote now and support your favourite!\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_vote":
      return {
        text: `🗳 New vote in ${p.name ?? "a competition"} — check the leaderboard.\n🔗 ${link}`,
        attachmentUrl: null,
      };
    case "competition_winner":
      return {
        text: `🥇 Winners announced for ${p.name ?? "the competition"}!\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "radio_live":
      return {
        text: `🎙 ${p.host ?? "The RJ"} is now LIVE on Radio.\n🔗 ${link}`,
        attachmentUrl: null,
      };
    case "chatroom_created":
      return {
        text: `💬 New chatroom created: ${p.name ?? ""}\nJoin the conversation.\n🔗 ${link}`,
        attachmentUrl: null,
      };
    case "level_up":
      return {
        text: `🔥 ${p.username ?? "A member"} reached Level ${p.level ?? "?"}.\nCongratulations!`,
        attachmentUrl: null,
      };
    default:
      return {
        text: `📢 ${ev.kind.replace(/_/g, " ")}`,
        attachmentUrl: img,
      };
  }
}

// Category → default enable flag key (matches feedbot_settings.event_flags)
export const CATEGORY_FLAG_KEYS: Record<string, string> = {
  feed_post: "feed_post",
  profile_avatar: "profile_avatar",
  profile_cover: "profile_cover",
  profile_bio: "profile_bio",
  new_member: "new_member",
  competition_started: "competition_started",
  competition_vote: "competition_vote",
  competition_winner: "competition_winner",
  radio_live: "radio_live",
  chatroom_created: "chatroom_created",
  level_up: "level_up",
};

export const CATEGORY_LABELS: Record<string, string> = {
  feed_post: "New feed post",
  profile_avatar: "Profile picture updated",
  profile_cover: "Cover photo updated",
  profile_bio: "Bio updated",
  new_member: "New member joined",
  competition_started: "Competition started",
  competition_vote: "New competition vote",
  competition_leader: "Competition leader changed",
  competition_ending: "Competition ending soon",
  competition_winner: "Competition winners",
  radio_live: "Radio live",
  chatroom_created: "New chatroom created",
  level_up: "Level up / XP milestone",
  daily_summary: "Daily AI summary (21:00 IST)",
};
