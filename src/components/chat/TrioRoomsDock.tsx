import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Users, Plus, Minus, X, Lock, EyeOff, Send, ShieldX, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useChat } from "@/lib/chat-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { FrameAvatar, CosmeticName } from "@/components/cosmetics/CosmeticBits";
import * as trio from "@/services/trio-rooms.service";

interface OpenRoom {
  id: string;
  name: string;
  ownerId: string;
}

interface RoomMsg {
  id: string;
  authorId: string;
  text: string;
  ts: number;
}

interface PendingInvite {
  roomId: string;
  roomName: string;
  ownerId: string;
  passwordRequired: boolean;
}

/**
 * Yahoo-style private mini rooms dock — separate from FloatingDMDock.
 * Sits bottom-left; shows pending invites + open trio room windows.
 */
export function TrioRoomsDock() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [openRooms, setOpenRooms] = useState<OpenRoom[]>([]);
  const [minimized, setMinimized] = useState<OpenRoom[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const uid = user?.id;

  // Load existing rooms the user is in + pending invites
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const [rooms, members] = await Promise.all([
          trio.listMyRooms(),
          trio.listMyMemberships(),
        ]);
        if (cancelled) return;
        const acceptedRoomIds = new Set(
          members.filter(m => m.status === "accepted").map(m => m.room_id),
        );
        // pre-open nothing; just collect invites
        const invitedIds = members.filter(m => m.status === "invited").map(m => m.room_id);
        const roomById = new Map(rooms.map(r => [r.id, r]));
        const inv: PendingInvite[] = [];
        for (const rid of invitedIds) {
          const r = roomById.get(rid);
          if (r) inv.push({ roomId: r.id, roomName: r.name, ownerId: r.owner_id, passwordRequired: false });
        }
        setInvites(inv);
        // optionally surface that user is in N rooms
        void acceptedRoomIds;
      } catch {
        /* swallow — RLS may filter */
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  // Allow other UI (e.g. members panel header icon) to open the create dialog
  useEffect(() => {
    const onOpenCreate = () => { setShowCreate(true); setShowPanel(true); };
    window.addEventListener("trio:open-create", onOpenCreate);
    return () => window.removeEventListener("trio:open-create", onOpenCreate);
  }, []);

  // Realtime: listen for new invites for me
  useEffect(() => {
    if (!uid) return;
    const ch = supabase
      .channel(`trio-invites-${uid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trio_room_members", filter: `user_id=eq.${uid}` },
        async (payload) => {
          const row = payload.new as { room_id: string; status: string };
          if (row.status !== "invited") return;
          const { data: r } = await supabase
            .from("trio_rooms")
            .select("id,name,owner_id")
            .eq("id", row.room_id)
            .maybeSingle();
          if (!r) return;
          setInvites(prev =>
            prev.some(p => p.roomId === r.id)
              ? prev
              : [...prev, { roomId: r.id, roomName: r.name, ownerId: r.owner_id, passwordRequired: false }],
          );
          setShowPanel(true);
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [uid]);

  const openRoom = useCallback((room: OpenRoom) => {
    // Only one fullscreen room at a time — minimize any currently open ones.
    setOpenRooms(prevOpen => {
      const others = prevOpen.filter(r => r.id !== room.id);
      if (others.length > 0) {
        setMinimized(m => {
          const next = [...m];
          for (const o of others) if (!next.some(n => n.id === o.id)) next.push(o);
          return next;
        });
      }
      return [room];
    });
    setMinimized(m => m.filter(r => r.id !== room.id));
  }, []);

  const closeWindow = (id: string) => {
    setOpenRooms(o => o.filter(r => r.id !== id));
    setMinimized(m => m.filter(r => r.id !== id));
  };

  const minimizeWindow = (room: OpenRoom) => {
    setOpenRooms(o => o.filter(r => r.id !== room.id));
    setMinimized(m => (m.some(r => r.id === room.id) ? m : [...m, room]));
    setShowPanel(true);
  };

  async function handleAccept(inv: PendingInvite, password?: string) {
    try {
      await trio.acceptInvite(inv.roomId, password);
      setInvites(prev => prev.filter(p => p.roomId !== inv.roomId));
      openRoom({ id: inv.roomId, name: inv.roomName, ownerId: inv.ownerId });
    } catch (e) {
      alert((e as Error).message || "Could not join");
    }
  }

  async function handleReject(inv: PendingInvite) {
    await trio.rejectInvite(inv.roomId);
    setInvites(prev => prev.filter(p => p.roomId !== inv.roomId));
  }

  if (!uid) return null;
  void isMobile;


  return (
    <>
      {/* Private rooms panel (opens via right-side header icon or pending invites) */}
      <div className="pointer-events-auto fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 max-w-[calc(100vw-2rem)]">
        {(showPanel || invites.length > 0) && (
          <div className="animate-scale-in w-72 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Private Rooms
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/25"
                >
                  <Plus className="h-3 w-3" /> Create
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  title="Close"
                  className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {invites.length === 0 && minimized.length === 0 && openRooms.length === 0 && (
              <div className="rounded-lg bg-muted/30 p-3 text-center text-[11px] text-muted-foreground">
                No active rooms. Create a private trio room to chat with up to 2 friends.
              </div>
            )}

            {invites.map(inv => (
              <InviteCard key={inv.roomId} inv={inv} onAccept={handleAccept} onReject={handleReject} />
            ))}

            {minimized.map(room => (
              <button
                key={room.id}
                onClick={() => openRoom(room)}
                className="mt-1 flex w-full items-center justify-between rounded-lg bg-muted/20 px-2 py-1.5 text-left text-xs hover:bg-muted/40"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Users className="h-3 w-3 text-primary" /> {room.name}
                </span>
                <span className="text-[10px] text-muted-foreground">Open</span>
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Fullscreen trio room (desktop: large centered card, mobile: full sheet) */}
      {openRooms.map(room => (
        <TrioRoomWindow
          key={room.id}
          room={room}
          meId={uid}
          onClose={() => closeWindow(room.id)}
          onMinimize={() => minimizeWindow(room)}
        />
      ))}


      {showCreate && (
        <CreateRoomDialog
          onClose={() => setShowCreate(false)}
          onCreated={(r) => {
            setShowCreate(false);
            openRoom({ id: r.id, name: r.name, ownerId: r.owner_id });
          }}
        />
      )}
    </>
  );
}

function InviteCard({
  inv,
  onAccept,
  onReject,
}: {
  inv: PendingInvite;
  onAccept: (inv: PendingInvite, password?: string) => void;
  onReject: (inv: PendingInvite) => void;
}) {
  const chat = useChat();
  const ownerName = chat.state.users[inv.ownerId]?.name ?? "Someone";
  const [pwd, setPwd] = useState("");
  return (
    <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5">
      <div className="text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{ownerName}</span> invited you to
      </div>
      <div className="mt-0.5 truncate text-sm font-semibold">{inv.roomName}</div>
      <input
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder="Password (if required)"
        className="mt-1.5 w-full rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-primary"
      />
      <div className="mt-2 flex gap-1.5">
        <button
          onClick={() => onAccept(inv, pwd || undefined)}
          className="flex-1 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
        >
          Accept
        </button>
        <button
          onClick={() => onReject(inv)}
          className="flex-1 rounded-md bg-muted/40 px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted/60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function CreateRoomDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (r: trio.TrioRoom) => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (!name.trim()) { setErr("Name required"); return; }
    setBusy(true);
    try {
      const r = await trio.createRoom({ name: name.trim(), password: password || null, hidden });
      onCreated(r);
    } catch (e) {
      setErr((e as Error).message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <div className="text-sm font-bold">Create Private Trio Room</div>
        </div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Room name</label>
        <input
          autoFocus
          value={name}
          maxLength={60}
          onChange={e => setName(e.target.value)}
          placeholder="Late night lounge"
          className="mb-3 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Password (optional)</label>
        <div className="mb-3 mt-1 flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Leave blank for open invite"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <label className="mb-3 flex items-center gap-2 text-xs text-foreground">
          <input type="checkbox" checked={hidden} onChange={e => setHidden(e.target.checked)} />
          <EyeOff className="h-3.5 w-3.5" />
          Hidden room (don't surface to others)
        </label>
        {err && <div className="mb-2 text-xs text-destructive">{err}</div>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-md bg-muted/40 px-3 py-2 text-sm hover:bg-muted/60">Cancel</button>
          <button onClick={submit} disabled={busy} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TrioRoomWindow({
  room,
  meId,
  onClose,
  onMinimize,
}: {
  room: OpenRoom;
  meId: string;
  onClose: () => void;
  onMinimize: () => void;
}) {
  const chat = useChat();
  const channelId = trio.trioChannel(room.id);
  const [messages, setMessages] = useState<RoomMsg[]>([]);
  const [members, setMembers] = useState<trio.TrioMember[]>([]);
  const [text, setText] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteErr, setInviteErr] = useState("");
  const [closed, setClosed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOwner = room.ownerId === meId;

  // initial fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id,author_id,text,created_at")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled) return;
      setMessages((data ?? []).map(r => ({
        id: r.id, authorId: r.author_id, text: r.text ?? "", ts: new Date(r.created_at).getTime(),
      })));
      const m = await trio.listMembers(room.id);
      if (!cancelled) setMembers(m);
    })();
    return () => { cancelled = true; };
  }, [channelId, room.id]);

  // realtime: messages + member changes + room closed
  useEffect(() => {
    const ch = supabase
      .channel(`trio-room-${room.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const r = payload.new as { id: string; author_id: string; text: string; created_at: string };
          setMessages(prev =>
            prev.some(m => m.id === r.id)
              ? prev
              : [...prev, { id: r.id, authorId: r.author_id, text: r.text ?? "", ts: new Date(r.created_at).getTime() }],
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trio_room_members", filter: `room_id=eq.${room.id}` },
        async () => {
          const m = await trio.listMembers(room.id);
          setMembers(m);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "trio_rooms", filter: `id=eq.${room.id}` },
        (payload) => {
          const r = payload.new as { closed_at: string | null };
          if (r.closed_at) setClosed(true);
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [channelId, room.id]);

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const activeMembers = useMemo(
    () => members.filter(m => m.status === "accepted" || m.status === "invited"),
    [members],
  );
  const canInvite = isOwner && activeMembers.length < 3 && !closed;

  async function send() {
    const t = text.trim();
    if (!t || closed) return;
    setText("");
    const { error } = await supabase.from("messages").insert({
      channel_id: channelId,
      author_id: meId,
      text: t,
      kind: "text",
    });
    if (error) {
      setText(t);
      alert(error.message);
    }
  }

  async function doInvite() {
    setInviteErr("");
    try {
      await trio.inviteByUsername(room.id, inviteName);
      setInviteName("");
      setShowInvite(false);
      const m = await trio.listMembers(room.id);
      setMembers(m);
    } catch (e) {
      setInviteErr((e as Error).message);
    }
  }

  async function forceClose() {
    if (!confirm("Close this room for everyone?")) return;
    await trio.closeRoom(room.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6">
      <div
        className="flex h-full w-full flex-col overflow-hidden border border-primary/40 bg-card/95 shadow-2xl backdrop-blur-xl animate-scale-in sm:h-[min(85vh,800px)] sm:w-[min(95vw,1100px)] sm:rounded-2xl"
        style={{ boxShadow: "0 10px 40px rgba(0,0,0,.4), 0 0 0 1px hsl(var(--primary)/0.25)" }}
      >

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-3 py-2">
        <Users className="h-4 w-4 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold">{room.name}</div>
          <div className="text-[10px] text-muted-foreground">
            {activeMembers.filter(m => m.status === "accepted").length}/3 in room
            {closed && " · closed"}
          </div>
        </div>
        <button
          title="Voice chat coming soon"
          disabled
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground/40 cursor-not-allowed"
        >
          <Mic className="h-3.5 w-3.5" />
        </button>
        {isOwner && !closed && (
          <button
            onClick={forceClose}
            title="Force close room"
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          >
            <ShieldX className="h-3.5 w-3.5" />
          </button>
        )}
        <button onClick={onMinimize} title="Minimize" className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <Minus className="h-4 w-4" />
        </button>
        <button onClick={onClose} title="Close" className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Members strip */}
      <div className="flex items-center gap-1.5 border-b border-border bg-card/60 px-2 py-1.5">
        {activeMembers.map(m => {
          const u = chat.state.users[m.user_id];
          return (
            <div key={m.user_id} className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] ${m.status === "accepted" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>
              {u ? <FrameAvatar user={u} size={16} /> : <span className="grid h-4 w-4 place-items-center rounded-full bg-muted text-[8px]">?</span>}
              <span className="max-w-[80px] truncate">{u ? <CosmeticName userId={u.id} name={u.name} /> : m.user_id.slice(0, 6)}</span>
              {m.status === "invited" && <span className="opacity-60">…</span>}
            </div>
          );
        })}
        {canInvite && (
          <button
            onClick={() => setShowInvite(s => !s)}
            className="ml-auto flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/25"
          >
            <Plus className="h-3 w-3" /> Invite
          </button>
        )}
      </div>

      {showInvite && (
        <div className="border-b border-border bg-muted/20 p-2">
          <div className="flex gap-1.5">
            <input
              autoFocus
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") doInvite(); }}
              placeholder="@username"
              className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-primary"
            />
            <button onClick={doInvite} className="rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">Send</button>
          </div>
          {inviteErr && <div className="mt-1 text-[10px] text-destructive">{inviteErr}</div>}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center text-[11px] text-muted-foreground">
            🔒 Private room. Only invited members can see this chat.
          </div>
        )}
        {messages.map(m => {
          const u = chat.state.users[m.authorId];
          const mine = m.authorId === meId;
          return (
            <div key={m.id} className={`flex gap-1.5 ${mine ? "flex-row-reverse" : ""}`}>
              {u && <FrameAvatar user={u} size={20} />}
              <div className={`max-w-[75%] rounded-2xl px-2.5 py-1.5 text-xs ${mine ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"}`}>
                {!mine && u && (
                  <div className="text-[9px] font-semibold opacity-70">
                    <CosmeticName userId={u.id} name={u.name} />
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
              </div>
            </div>
          );
        })}
        {closed && (
          <div className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-center text-[11px] text-destructive">
            This room was closed.
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-1.5 border-t border-border bg-card/70 px-2 py-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          disabled={closed}
          placeholder={closed ? "Room closed" : "Private message…"}
          className="min-w-0 flex-1 rounded-full bg-muted/40 px-3 py-1.5 text-xs outline-none focus:bg-muted/60 disabled:opacity-50"
        />
        <button onClick={send} disabled={!text.trim() || closed} className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
      </div>
    </div>
  );

}
