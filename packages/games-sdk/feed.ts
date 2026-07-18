import type { SDKResult } from "./types";

export interface FeedPostInput {
  text?: string;
  imageUrl?: string;
  linkUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface FeedPostResult {
  postId: string;
  url?: string;
}

export interface FeedAdapter {
  publishFeed(input: FeedPostInput): Promise<SDKResult<FeedPostResult>>;
}
