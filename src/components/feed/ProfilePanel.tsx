import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Crown, Shield, ShieldHalf, Trophy, Flame, Award, Coins, UserPlus, UserMinus, Ban, ShieldCheck } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "@/components/chat/Avatar";
import { FrameAvatar, CosmeticName, RankChip } from "@/components/cosmetics/CosmeticBits";
import { BADGE_MAP, TIER_COLOR } from "@/lib/achievements";
import { useRecordProfileView } from "@/lib/use-profile-views";
import { UserCompetitionShowcase } from "@/components/competitions/UserCompetitionShowcase";
import { ProfileMehfilSection } from "@/components/mehfil/ProfileMehfilSection";

export function ProfilePanel({ username, onBack }: { username: string; onBack: () => void }) {
  const navigate = useNavigate();
  const { state, startDM, addFriend, removeFriend, blockUser, unblockUser, isFriend, isBlocked } = useChat();

  const user = Object.values(state.users).find(u => u.name.toLowerCase() === username.toLowerCase());
  useRecordProfileView(user && !user.isBot && user.id !== "me" ? user.id : null);
  const ranked = Object.values(state.users).sort((a, b) => b.xp - a.xp);
  const rank = user ? ranked.findIndex(u => u.id === user.id) + 1 : 0;
  const sharedRooms = user ? Object.values(state.rooms).filter(r => r.members.includes(user.id)) : [];
  const recentMessages = user
    ? Object.values(state.messages).flat().filter(m => m.authorId === user.id).sort((a, b) => b.ts - a.ts).slice(0, 5)
    : [];

  if (!user) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">No member named @{username}.</p>
        <button onClick={onBack} className="mt-6 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to feed</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-panel)" }}>
        <div className="flex items-start gap-5">
          <FrameAvatar user={user} size={96} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold"><CosmeticName userId={user.id} name={user.name} /></h1>
              <RankChip level={user.level} />
              {user.isBot && <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-primary">Bot</span>}
              <span className={`flex items-center gap-1.5 text-xs capitalize ${user.status === "online" ? "text-primary" : "text-muted-foreground"}`}>
                <span className={`h-2 w-2 rounded-full ${user.status === "online" ? "bg-primary" : "bg-muted-foreground/50"}`} />
                {user.status}
              </span>
            </div>
            {user.bio && <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>}
            {user.id !== "me" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => { startDM(user.id); navigate({ to: "/" }); }} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  <MessageCircle className="h-4 w-4" /> Send message
                </button>
                {isFriend(user.id) ? (
                  <button onClick={() => removeFriend(user.id)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-white/5"><UserMinus className="h-4 w-4" /> Friends</button>
                ) : (
                  <button onClick={() => addFriend(user.id)} className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"><UserPlus className="h-4 w-4" /> Add friend</button>
                )}
                {isBlocked(user.id) ? (
                  <button onClick={() => unblockUser(user.id)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-white/5"><ShieldCheck className="h-4 w-4" /> Unblock</button>
                ) : (
                  <button onClick={() => blockUser(user.id)} className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20"><Ban className="h-4 w-4" /> Block</button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Level" value={`Lv ${user.level}`} />
          <Stat label="XP" value={`${user.xp}`} />
          <Stat label="Coins" value={`${user.coins ?? 0}`} icon={<Coins className="h-3.5 w-3.5 text-yellow-500" />} />
          <Stat label="Streak" value={`${user.streak ?? 0}d`} icon={<Flame className="h-3.5 w-3.5 text-orange-400" />} />
          <Stat label="Rank" value={rank ? `#${rank}` : "—"} icon={<Trophy className="h-3.5 w-3.5 text-warning" />} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Award className="h-3.5 w-3.5 text-primary" /> Badges ({(user.badges || []).length})
        </h2>
        {(user.badges || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No badges yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(user.badges || []).map(id => {
              const b = BADGE_MAP[id]; if (!b) return null;
              return (
                <div key={id} className={`flex items-center gap-1 rounded-full border bg-gradient-to-br px-2.5 py-1 text-[11px] font-semibold ${TIER_COLOR[b.tier]}`} title={b.description}>
                  <span>{b.emoji}</span>{b.name}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {!user.isBot && <UserCompetitionShowcase username={user.name} />}


      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rooms ({sharedRooms.length})</h2>
        <div className="grid gap-2">
          {sharedRooms.map(r => {
            const role = r.roles[user.id] || "member";
            return (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-primary">#</span>{r.name}
                    {role === "owner" && <Crown className="h-3 w-3 text-warning" />}
                    {role === "admin" && <Shield className="h-3 w-3 text-primary" />}
                    {role === "mod" && <ShieldHalf className="h-3 w-3 text-primary/70" />}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{r.topic}</div>
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{role}</span>
              </div>
            );
          })}
          {sharedRooms.length === 0 && <p className="text-sm text-muted-foreground">Not in any rooms.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recent messages</h2>
        <div className="space-y-2">
          {recentMessages.map(m => (
            <div key={m.id} className="rounded-2xl border border-border bg-card px-4 py-3">
              <p className="text-sm text-foreground/90">{m.text || (m.attachment ? `📎 ${m.attachment.name}` : "")}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                in {state.rooms[m.channelId]?.name || (m.channelId.startsWith("dm:") ? "DM" : m.channelId)}
              </p>
            </div>
          ))}
          {recentMessages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white/5 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
