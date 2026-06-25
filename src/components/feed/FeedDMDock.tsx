import { useEffect, useMemo, useState } from "react";
import { MessageCircle, X, ChevronLeft, Search, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "@/components/chat/Avatar";
import { FrameAvatar, CosmeticName } from "@/components/cosmetics/CosmeticBits";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { deleteMyDmConversation } from "@/lib/account-dm.functions";
import type { User } from "@/lib/chat-types";
import type { FeedFriendship } from "@/lib/feed-types";


interface Props {
  meId: string;
  profiles: Record<string, User>;
  initialOpen?: boolean;
  onClose?: () => void;
}

export function FeedDMDock({ meId, profiles, initialOpen = false, onClose }: Props) {
  const { state, startDM, isDM, isDmUnread, dmUnreadCount } = useChat();
  const [open, setOpen] = useState(initialOpen);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "chat">("list");
  const [q, setQ] = useState("");
  const [deletingDm, setDeletingDm] = useState(false);
  const deleteDm = useServerFn(deleteMyDmConversation);


  useEffect(() => { if (initialOpen) setOpen(true); }, [initialOpen]);

  useEffect(() => {
    if (!meId) return;
    async function load() {
      const { data } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted");
      const ids = ((data ?? []) as FeedFriendship[]).map(f =>
        f.sender_id === meId ? f.receiver_id : f.sender_id
      );
      setFriendIds(ids);
    }
    load();
    const ch = supabase
      .channel(`dock-fr-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [meId]);

  // When active channel becomes a DM, switch to chat view
  useEffect(() => {
    if (open && isDM(state.activeChannel)) setView("chat");
  }, [open, state.activeChannel, isDM]);

  const friends = useMemo(() => {
    const ids = new Set<string>(friendIds);
    // Also include any peers the user has an active DM thread with
    for (const id of state.dmOrder ?? []) ids.add(id);
    const list = Array.from(ids)
      .map(id => profiles[id] ?? state.users[id])
      .filter(Boolean) as User[];
    if (!q.trim()) return list;
    const t = q.toLowerCase();
    return list.filter(u => u.name.toLowerCase().includes(t));
  }, [friendIds, profiles, q, state.dmOrder, state.users]);


  const activePeerId = useMemo(() => {
    const ch = state.activeChannel;
    if (!ch.startsWith("dm:")) return null;
    const parts = ch.slice(3).split(":");
    return parts.find(p => p !== meId) ?? null;
  }, [state.activeChannel, meId]);

  const activePeer = activePeerId ? (profiles[activePeerId] ?? state.users[activePeerId]) : null;

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 hover:scale-105 transition lg:bottom-6"
        aria-label="Open messages"
        title="Messages"
      >
        <MessageCircle className="h-5 w-5" />
        {dmUnreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
            {dmUnreadCount > 9 ? "9+" : dmUnreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 flex h-[70vh] max-h-[560px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl lg:bottom-6">
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
        {view === "chat" ? (
          <>
            <button onClick={() => setView("list")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent" aria-label="Back">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {activePeer && <FrameAvatar user={activePeer} size={28} />}
            <div className="min-w-0 flex-1 truncate text-sm font-semibold">
              {activePeer ? <CosmeticName userId={activePeer.id} name={activePeer.name} /> : "Direct message"}
            </div>
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4 text-primary" />
            <div className="flex-1 text-sm font-bold">Messages</div>
          </>
        )}
        <button onClick={handleClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      {view === "list" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-3 pt-2">
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search friends"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>
          <div className="mt-2 flex-1 overflow-y-auto px-1.5 pb-2">
            {friends.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                {friendIds.length === 0 && (state.dmOrder ?? []).length === 0 ? "Add friends or message a user to start chatting." : "No matches."}
              </p>
            ) : friends.map(u => (
              <button
                key={u.id}
                onClick={() => { startDM(u.id); setView("chat"); }}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-accent"
              >
                <FrameAvatar user={u} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium"><CosmeticName userId={u.id} name={u.name} /></span>
                    {isDmUnread(u.id) && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" title="Unread" />
                    )}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {u.status === "online" ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {isDM(state.activeChannel) ? (
            <>
              <div className="flex min-h-0 flex-1 flex-col">
                <MessageList channelId={state.activeChannel} />
              </div>
              <MessageInput />
            </>
          ) : (
            <div className="grid flex-1 place-items-center px-6 text-center text-xs text-muted-foreground">
              Select a friend to start a direct message.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
