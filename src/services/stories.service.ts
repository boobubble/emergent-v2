import { notImplemented } from "./_shared";

export interface StoryPostInput { mediaUrl: string; durationSec?: number }
export interface StoriesService {
  post(input: StoryPostInput): Promise<{ id: string }>;
  feed(): Promise<unknown[]>;
  view(storyId: string): Promise<void>;
}

export const storiesService: StoriesService = {
  post: () => notImplemented("stories", "post"),
  feed: () => notImplemented("stories", "feed"),
  view: () => notImplemented("stories", "view"),
};
