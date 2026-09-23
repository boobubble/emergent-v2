export type PlatformChannelKind = "system" | "admin";

export type PlatformChannelRecord = {
  id: string;
  channel_number: number;
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
  archived_at: string | null;
  guest_allowed: boolean;
  sort_order: number;
  channel_kind: PlatformChannelKind;
  created_at: string;
  updated_at: string;
};

export type PlatformChannelBotRecord = {
  id: string;
  channel_id: string;
  bot_key: string;
  enabled: boolean;
  config: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
