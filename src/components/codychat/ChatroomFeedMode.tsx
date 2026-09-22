import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/FeedSkeletons";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import type { FeedPost } from "@/lib/feed-types";
import type { FeedFetchMode } from "@/lib/feed-prefs";
import {
  CHATROOM_FEED_PAGE_SIZE,
  cursorFromChatroomFeedPost,
  fetchChatroomFeedPage,
  type ChatroomFeedCursor,
} from "@/lib/chatroom-feed-fetch";
import {
  cardsBeforeSidebarBlock,
  CHATROOM_FEED_SIDEBAR_BLOCKS,
  ChatroomFeedSidebarBlock,
} from "./ChatroomFeedSidebarBlock";

type StreamItem =
  | { type: "post"; post: FeedPost }
  | { type: "block"; blockId: (typeof CHATROOM_FEED_SIDEBAR_BLOCKS)[number]; blockIndex: number };

function feedModeFromTab(tab?: string): FeedFetchMode {
  return tab === "trending" ? "trending" : "chronological";
}

function buildStreamItems(posts: FeedPost[]): StreamItem[] {
  const items: StreamItem[] = [];
  let postIndex = 0;
  let blockIndex = 0;

  while (postIndex < posts.length) {
    const batchSize = cardsBeforeSidebarBlock(blockIndex);
    for (let i = 0; i < batchSize && postIndex < posts.length; i += 1) {
      items.push({ type: "post", post: posts[postIndex] });
      postIndex += 1;
    }
    if (postIndex < posts.length || blockIndex === 0) {
      const blockId = CHATROOM_FEED_SIDEBAR_BLOCKS[blockIndex % CHATROOM_FEED_SIDEBAR_BLOCKS.length];
      items.push({ type: "block", blockId, blockIndex });
      blockIndex += 1;
    }
  }

  return items;
}

type ChatroomFeedModeProps = {
  tab?: string;
};

export function ChatroomFeedMode({ tab }: ChatroomFeedModeProps) {
  const fetchMode = feedModeFromTab(tab);
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const meId = user?.id ?? "";
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<ChatroomFeedCursor | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const streamItems = useMemo(() => buildStreamItems(posts), [posts]);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    cursorRef.current = null;
    const { posts: page, error } = await fetchChatroomFeedPage(
      fetchMode,
      null,
      CHATROOM_FEED_PAGE_SIZE,
    );
    if (error) {
      setFetchError(error);
      setPosts([]);
      setHasMore(false);
    } else {
      setPosts(page);
      setHasMore(page.length >= CHATROOM_FEED_PAGE_SIZE);
      if (page.length > 0) {
        cursorRef.current = cursorFromChatroomFeedPost(page[page.length - 1], fetchMode);
      }
    }
    setLoading(false);
  }, [fetchMode]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    const { posts: page, error } = await fetchChatroomFeedPage(
      fetchMode,
      cursorRef.current,
      CHATROOM_FEED_PAGE_SIZE,
    );
    if (error) {
      setFetchError(error);
    } else if (page.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const next = [...prev];
        for (const p of page) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            next.push(p);
          }
        }
        return next;
      });
      cursorRef.current = cursorFromChatroomFeedPost(page[page.length - 1], fetchMode);
      if (page.length < CHATROOM_FEED_PAGE_SIZE) setHasMore(false);
    }
    setLoadingMore(false);
  }, [fetchMode, hasMore, loadingMore]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, streamItems.length]);

  const heading =
    fetchMode === "trending" ? "Trending in Yaarzo" : "Your feed";

  return (
    <div className="chatroom-feed-mode w-full">
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <h3 className="text-sm font-semibold">{heading}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => void loadInitial()}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : fetchError ? (
        <div className="feed-card flex flex-col items-center gap-3 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive/80" aria-hidden />
          <p className="text-sm text-muted-foreground">{fetchError}</p>
          <Button type="button" size="sm" onClick={() => void loadInitial()}>
            Try again
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="feed-card p-8 text-center text-sm text-muted-foreground">
          No posts yet. Check back soon.
        </div>
      ) : (
        <div className="chatroom-feed-post-list space-y-3">
          {streamItems.map((item) =>
            item.type === "post" ? (
              <PostCard
                key={`post-${item.post.id}`}
                post={item.post}
                profiles={profiles}
                meId={meId}
              />
            ) : (
              <ChatroomFeedSidebarBlock
                key={`block-${item.blockIndex}-${item.blockId}`}
                blockId={item.blockId}
              />
            ),
          )}
        </div>
      )}

      {loadingMore ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary/70" aria-hidden />
        </div>
      ) : null}
      <div ref={sentinelRef} className="h-1" aria-hidden />
    </div>
  );
}
