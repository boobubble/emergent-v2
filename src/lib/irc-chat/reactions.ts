export const IRC_REACTION_TYPES = ["heart", "laugh", "fire", "like"] as const;
export type IrcReactionType = (typeof IRC_REACTION_TYPES)[number];

export type IrcReactionBucket = {
  count: number;
  reactedByMe: boolean;
};

export type IrcMessageReactions = Record<IrcReactionType, IrcReactionBucket>;

export type IrcRoomReactionsState = Record<string, IrcMessageReactions>;

export const IRC_REACTION_EMOJI: Record<IrcReactionType, string> = {
  heart: "❤️",
  laugh: "😂",
  fire: "🔥",
  like: "👍",
};

export const IRC_REACTION_LIST_BATCH_MAX = 100;

export function emptyMessageReactions(): IrcMessageReactions {
  return {
    heart: { count: 0, reactedByMe: false },
    laugh: { count: 0, reactedByMe: false },
    fire: { count: 0, reactedByMe: false },
    like: { count: 0, reactedByMe: false },
  };
}

export function isIrcReactionType(value: unknown): value is IrcReactionType {
  return (
    typeof value === "string" &&
    (IRC_REACTION_TYPES as readonly string[]).includes(value.trim().toLowerCase())
  );
}

export function parseIrcReactionType(value: unknown): IrcReactionType | null {
  if (!isIrcReactionType(value)) return null;
  return value.trim().toLowerCase() as IrcReactionType;
}

export function mergeMessageReactions(
  current: IrcMessageReactions | undefined,
  incoming: IrcMessageReactions,
): IrcMessageReactions {
  const base = current ? { ...current } : emptyMessageReactions();
  for (const type of IRC_REACTION_TYPES) {
    base[type] = {
      count: Math.max(0, incoming[type]?.count ?? 0),
      reactedByMe: Boolean(incoming[type]?.reactedByMe),
    };
  }
  return base;
}

export function applyOptimisticReactionToggle(
  current: IrcMessageReactions | undefined,
  reactionType: IrcReactionType,
): IrcMessageReactions {
  const next = current
    ? mergeMessageReactions(undefined, current)
    : emptyMessageReactions();
  const bucket = next[reactionType];
  if (bucket.reactedByMe) {
    bucket.reactedByMe = false;
    bucket.count = Math.max(0, bucket.count - 1);
  } else {
    bucket.reactedByMe = true;
    bucket.count += 1;
  }
  return next;
}

export function hasVisibleReactions(reactions: IrcMessageReactions | undefined): boolean {
  if (!reactions) return false;
  return IRC_REACTION_TYPES.some((type) => reactions[type].count > 0);
}

export function parseReactionBucketsFromUnknown(raw: unknown): IrcMessageReactions | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const out = emptyMessageReactions();
  for (const type of IRC_REACTION_TYPES) {
    const row = source[type];
    if (!row || typeof row !== "object") continue;
    const bucket = row as Record<string, unknown>;
    const count = typeof bucket.count === "number" ? bucket.count : Number(bucket.count);
    out[type] = {
      count: Number.isFinite(count) && count > 0 ? Math.floor(count) : 0,
      reactedByMe: Boolean(bucket.reactedByMe),
    };
  }
  return out;
}
