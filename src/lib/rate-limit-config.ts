// Client-safe default rate-limit map — imported by both admin UI and server helper.
export interface RateLimitDef { limit: number; window: number }

export const DEFAULT_LIMITS: Record<string, RateLimitDef> = {
  "auth.login":            { limit: 8,   window: 60 },
  "auth.signup":           { limit: 5,   window: 300 },
  "auth.password_reset":   { limit: 3,   window: 900 },
  "feed.post":             { limit: 6,   window: 60 },
  "feed.comment":          { limit: 20,  window: 60 },
  "feed.reaction":         { limit: 60,  window: 60 },
  "chat.message":          { limit: 30,  window: 60 },
  "chat.reaction":         { limit: 60,  window: 60 },
  "competition.vote":      { limit: 30,  window: 60 },
  "competition.create":    { limit: 3,   window: 3600 },
  "community.join":        { limit: 10,  window: 300 },
  "community.create":      { limit: 3,   window: 3600 },
  "community.invite":      { limit: 10,  window: 300 },
  "community.redeem":      { limit: 10,  window: 300 },
  "report.submit":         { limit: 10,  window: 300 },
  "search":                { limit: 60,  window: 60 },
  "profile.edit":          { limit: 20,  window: 300 },
  "upload.avatar":         { limit: 10,  window: 300 },
  "upload.banner":         { limit: 10,  window: 300 },
  "follow":                { limit: 30,  window: 60 },
  "api":                   { limit: 120, window: 60 },
};
