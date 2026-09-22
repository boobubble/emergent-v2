import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { BoobubbleAssistantWidget } from "@/components/feed/BoobubbleAssistantWidget";
import { HashtagsWidget } from "@/components/feed/SideWidgets";
import { FriendsWidget } from "@/components/feed/SideWidgets";
import { TrendingCommunitiesWidget } from "@/components/feed/DiscoveryWidgets";
import { FeedNotificationPanel } from "@/components/feed/FeedNotifications";
import { CodyChatRadioWidget } from "./CodyChatRadioWidget";
import { useCodyChatCommunity } from "./use-codychat-community";

export type ChatroomFeedSidebarBlockId =
  | "assistant"
  | "trending"
  | "suggested-friends"
  | "radio"
  | "communities"
  | "notifications";

type ChatroomFeedSidebarBlockProps = {
  blockId: ChatroomFeedSidebarBlockId;
};

export function ChatroomFeedSidebarBlock({ blockId }: ChatroomFeedSidebarBlockProps) {
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const { enabledWidgets } = useCodyChatCommunity();
  const meId = user?.id ?? "";

  return (
    <div className="chatroom-feed-injected-block" data-chatroom-feed-block={blockId}>
      {blockId === "assistant" ? <BoobubbleAssistantWidget /> : null}
      {blockId === "trending" ? <HashtagsWidget /> : null}
      {blockId === "suggested-friends" && meId ? (
        <FriendsWidget meId={meId} profiles={profiles} />
      ) : null}
      {blockId === "radio" ? (
        <CodyChatRadioWidget widgets={enabledWidgets} className="w-full" />
      ) : null}
      {blockId === "communities" ? <TrendingCommunitiesWidget /> : null}
      {blockId === "notifications" && meId ? (
        <div className="feed-card overflow-hidden">
          <FeedNotificationPanel meId={meId} profiles={profiles} />
        </div>
      ) : null}
    </div>
  );
}

export const CHATROOM_FEED_SIDEBAR_BLOCKS: ChatroomFeedSidebarBlockId[] = [
  "assistant",
  "trending",
  "suggested-friends",
  "radio",
  "communities",
  "notifications",
];

/** Alternate 3 then 4 cards between injected sidebar blocks. */
export function cardsBeforeSidebarBlock(blockIndex: number): number {
  return blockIndex % 2 === 0 ? 3 : 4;
}
