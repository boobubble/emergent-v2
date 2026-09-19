import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatroomDiscoveryPanel } from "@/components/discovery/ChatroomDiscoveryPanel";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  joinedChannelIds: string[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
};

/**
 * IRC-safe wrapper around legacy discovery UI (no ChatProvider).
 * onSelectChannel should join the room via IrcChatCore.
 */
export function IrcChatRoomDiscoverySheet({
  open,
  onOpenChange,
  joinedChannelIds,
  activeChannelId,
  onSelectChannel,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[min(100vw,320px)] overflow-y-auto p-0">
        <SheetHeader className="border-b border-border/60 px-4 py-3 text-left">
          <SheetTitle className="text-base">Explore chatrooms</SheetTitle>
        </SheetHeader>
        <div className="p-2">
          <ChatroomDiscoveryPanel
            joinedChannelIds={joinedChannelIds}
            activeChannelId={activeChannelId}
            filter="all"
            onSelectChannel={(id) => {
              onSelectChannel(id);
              onOpenChange(false);
            }}
            localRoomCount={joinedChannelIds.length}
            suppressJoinedSection={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
