import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inviteToGame } from "@/lib/games.functions";

interface Profile { id: string; username: string; avatar_url: string | null; avatar_color: string; }

export function InviteFriendsDialog({ open, onClose, gameId }: { open: boolean; onClose: () => void; gameId: string | null }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState<string | null>(null);
  const invite = useServerFn(inviteToGame);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      // Friends first
      const { data: friendships } = await supabase
        .from("friendships")
        .select("sender_id, receiver_id, status")
        .eq("status", "accepted")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      const friendIds = (friendships ?? [])
        .map(f => (f.sender_id === user.id ? f.receiver_id : f.sender_id));
      if (friendIds.length === 0) {
        // Fall back: top 15 most recent profiles (so single-user installs can still invite someone)
        const { data: recent } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, avatar_color")
          .neq("id", user.id)
          .order("last_seen", { ascending: false })
          .limit(15);
        if (!cancelled) setFriends((recent ?? []) as Profile[]);
        return;
      }
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, avatar_color")
        .in("id", friendIds);
      if (!cancelled) setFriends((profiles ?? []) as Profile[]);
    })();
    return () => { cancelled = true; };
  }, [open, user]);

  async function handleInvite(receiverId: string) {
    if (!gameId) return;
    setInviting(receiverId);
    try {
      await invite({ data: { gameId, receiverId } });
      toast.success("Invite sent");
    } catch (e) {
      toast.error((e as Error).message || "Failed to invite");
    } finally {
      setInviting(null);
    }
  }

  const filtered = friends.filter(f => f.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite to Ludo</DialogTitle>
        </DialogHeader>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search friends…"
          className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No one to invite yet.</div>
          )}
          {filtered.map(f => (
            <div key={f.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
              <div
                className="grid h-9 w-9 place-items-center overflow-hidden rounded-full text-sm font-bold text-white"
                style={{ background: f.avatar_color }}
              >
                {f.avatar_url ? (
                  <img src={f.avatar_url} alt={f.username} className="h-full w-full object-cover" />
                ) : f.username[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 truncate text-sm font-medium">{f.username}</div>
              <button
                onClick={() => handleInvite(f.id)}
                disabled={inviting === f.id}
                className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {inviting === f.id ? "…" : "Invite"}
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
