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
  persona_bot_id?: string | null;
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
    case "competition_published":
      return {
        text: `📣 New competition announced: ${p.name ?? ""}\nGet ready to compete and vote.\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_registration_open":
      return {
        text: `📝 Registration is OPEN for ${p.name ?? "a competition"}.\nJoin now!\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_registration_close":
      return {
        text: `🔒 Registration closed for ${p.name ?? "the competition"}. Voting is starting!\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_ending":
      return {
        text: `⏳ ${p.name ?? "The competition"} ends soon — last chance to vote!\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_ended":
      return {
        text: `🏁 Voting closed for ${p.name ?? "the competition"}. Winners coming up!\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_featured":
      return {
        text: `⭐ Featured competition: ${p.name ?? ""}\nDon't miss this one.\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_trending":
      return {
        text: `🔥 Trending now: ${p.name ?? "a competition"} — activity spiking!\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_vote_milestone":
      return {
        text: `🎯 ${p.name ?? "A competition"} just crossed ${(p.milestone as number) ?? "?"} votes! Total: ${(p.total_votes as number) ?? "?"}\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_leader_change":
      return {
        text: `👑 New leader in ${p.name ?? "a competition"}: ${p.leader ?? "?"} with ${(p.votes as number) ?? 0} votes.\n🔗 ${link}`,
        attachmentUrl: img,
      };
    case "competition_nominee_joined":
      return {
        text: `🙋 ${p.username ?? "A new nominee"} joined ${p.name ?? "the competition"}.\n🔗 ${link}`,
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
  competition_published: "competition_published",
  competition_registration_open: "competition_registration_open",
  competition_registration_close: "competition_registration_close",
  competition_started: "competition_started",
  competition_ending: "competition_ending",
  competition_ended: "competition_ended",
  competition_vote: "competition_vote",
  competition_vote_milestone: "competition_vote_milestone",
  competition_leader_change: "competition_leader_change",
  competition_nominee_joined: "competition_nominee_joined",
  competition_featured: "competition_featured",
  competition_trending: "competition_trending",
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
  daily_summary: "Daily AI summary (21:00 IST)",
};

export const COMPETITION_CATEGORY_KEYS: string[] = [
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
  "competition_winner",
];
