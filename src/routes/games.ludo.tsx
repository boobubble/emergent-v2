import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Dice5, Users, ArrowLeft, Trophy, Plus, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { LudoBoard } from "@/components/games/LudoBoard";
import { InviteFriendsDialog } from "@/components/games/InviteFriendsDialog";
import {
  createLudoMatch,
  joinQuickMatch,
  leaveGame,
  listLeaderboard,
  listMyGames,
  moveToken,
  rollDice,
} from "@/lib/games.functions";
import {
  LUDO_SEATS_FOR_TYPE,
  LudoState,
  SEAT_COLORS,
  SEAT_NAMES,
  initLudoState,
} from "@/lib/games-engine";

interface GameRow {
  id: string;
  game_type: string;
  status: string;
  current_turn_seat: number;
  turn_count: number;
  created_by: string;
  winner_id: string | null;
  state: LudoState;
}
interface PlayerRow {
  id: string;
  game_id: string;
  user_id: string;
  seat: number;
  color: string;
}
interface ProfileRow { id: string; username: string; avatar_color: string; avatar_url: string | null; }

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Games — Realtime Ludo & more" },
      { name: "description", content: "Play realtime multiplayer Ludo with friends. Earn XP, coins, and climb the leaderboard." },
      { property: "og:title", content: "Games" },
      { property: "og:description", content: "Realtime multiplayer Ludo. Quick match, invite friends, earn rewards." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  component: GamesPage,
});

function GamesPage() {
  const { id: gameIdFromUrl } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.isGuest) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div className="max-w-sm">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Sign in to play</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create a free account to play Ludo, earn XP and climb the leaderboard.</p>
          <Link to="/" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link>
        </div>
      </div>
    );
  }

  if (gameIdFromUrl) return <ActiveGameView gameId={gameIdFromUrl} onLeave={() => navigate({ to: "/games", search: {} })} />;

  return <GamesLobby userId={user.id} onOpenGame={(id) => navigate({ to: "/games", search: { id } as never })} />;
}

// ---------------- Lobby ----------------
function GamesLobby({ userId, onOpenGame }: { userId: string; onOpenGame: (id: string) => void }) {
  const create = useServerFn(createLudoMatch);
  const quick = useServerFn(joinQuickMatch);
  const myGames = useServerFn(listMyGames);
  const leaderboard = useServerFn(listLeaderboard);
  const [myGameRows, setMyGameRows] = useState<{ game_id: string; games: { id: string; game_type: string; status: string; winner_id: string | null } }[]>([]);
  const [board, setBoard] = useState<{ user_id: string; xp: number; profile: ProfileRow | null }[]>([]);
  const [invitingGameId, setInvitingGameId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const [g, lb] = await Promise.all([myGames(), leaderboard()]);
    setMyGameRows(g.rows as never);
    setBoard(lb.rows as never);
  }
  useEffect(() => { reload(); }, []);

  // Realtime: any change to my game_players rows → reload
  useEffect(() => {
    const ch = supabase
      .channel(`my-games-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "game_players", filter: `user_id=eq.${userId}` }, reload)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games" }, reload)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleStartPrivate(type: "ludo_1v1" | "ludo_4p") {
    setBusy(true);
    try {
      const { gameId } = await create({ data: { type, visibility: "private" } });
      setInvitingGameId(gameId);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  }
  async function handleQuickMatch() {
    setBusy(true);
    try {
      const { gameId } = await quick({ data: { type: "ludo_1v1" } });
      onOpenGame(gameId);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/" className="rounded-full p-2 hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">Games</h1>
            <p className="text-xs text-muted-foreground">Realtime multiplayer · Earn XP & coins</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-5">
        {/* Quick actions */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={handleQuickMatch}
            disabled={busy}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-primary/5 p-4 text-left transition-all hover:scale-[1.02] hover:border-primary disabled:opacity-50"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Dice5 className="h-6 w-6" /></div>
            <div>
              <div className="font-bold">Quick Match</div>
              <div className="text-xs text-muted-foreground">Auto-find a 1v1 opponent</div>
            </div>
          </button>
          <button
            onClick={() => handleStartPrivate("ludo_1v1")}
            disabled={busy}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary disabled:opacity-50"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground"><Users className="h-6 w-6" /></div>
            <div>
              <div className="font-bold">Invite · 2 Players</div>
              <div className="text-xs text-muted-foreground">Private 1v1 with a friend</div>
            </div>
          </button>
          <button
            onClick={() => handleStartPrivate("ludo_4p")}
            disabled={busy}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary disabled:opacity-50"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground"><Users className="h-6 w-6" /></div>
            <div>
              <div className="font-bold">Invite · 4 Players</div>
              <div className="text-xs text-muted-foreground">Private 4-player Ludo party</div>
            </div>
          </button>
        </section>


        {/* Active / recent games */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Matches</h2>
            <button onClick={reload} className="text-xs text-muted-foreground hover:text-foreground">Refresh</button>
          </div>
          <div className="space-y-2">
            {myGameRows.length === 0 && <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">No matches yet — start one above!</div>}
            {myGameRows.map(r => {
              const g = r.games;
              return (
                <button
                  key={g.id}
                  onClick={() => onOpenGame(g.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 text-left hover:border-primary"
                >
                  <div>
                    <div className="text-sm font-semibold">Ludo · {g.game_type.replace("ludo_", "")}</div>
                    <div className="text-xs text-muted-foreground">
                      {g.status === "waiting" ? "Waiting for opponent" :
                       g.status === "active" ? "In progress" :
                       g.status === "finished" ? (g.winner_id === userId ? "🏆 You won" : "Finished") :
                       "Cancelled"}
                    </div>
                  </div>
                  <div className="text-xs font-bold uppercase text-primary">Open →</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Players · 7d</h2>
          </div>
          <div className="space-y-1 rounded-xl border border-border bg-card p-2">
            {board.length === 0 && <div className="px-2 py-4 text-center text-sm text-muted-foreground">No rewards earned yet this week.</div>}
            {board.map((r, i) => (
              <div key={r.user_id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
                <div className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</div>
                <div className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white" style={{ background: r.profile?.avatar_color || "#666" }}>
                  {r.profile?.avatar_url ? <img src={r.profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" /> : (r.profile?.username?.[0]?.toUpperCase() ?? "?")}
                </div>
                <div className="flex-1 text-sm font-medium">{r.profile?.username || "Unknown"}</div>
                <div className="text-sm font-bold text-primary">+{r.xp} XP</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <InviteFriendsDialog
        open={invitingGameId != null}
        gameId={invitingGameId}
        onClose={() => { setInvitingGameId(null); reload(); }}
      />
      {invitingGameId && (
        <div className="fixed inset-x-0 bottom-4 z-20 mx-auto w-fit rounded-full bg-card px-4 py-2 text-xs text-muted-foreground shadow-lg">
          <button className="font-bold text-primary" onClick={() => onOpenGame(invitingGameId)}>Open waiting room →</button>
        </div>
      )}
    </div>
  );
}

// ---------------- Active match ----------------
function ActiveGameView({ gameId, onLeave }: { gameId: string; onLeave: () => void }) {
  const { user } = useAuth();
  const meId = user!.id;
  const [game, setGame] = useState<GameRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const roll = useServerFn(rollDice);
  const move = useServerFn(moveToken);
  const leave = useServerFn(leaveGame);

  // Initial load + realtime
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [{ data: g }, { data: pl }] = await Promise.all([
        supabase.from("games").select("*").eq("id", gameId).maybeSingle(),
        supabase.from("game_players").select("*").eq("game_id", gameId).order("seat"),
      ]);
      if (cancelled) return;
      if (!g) { toast.error("Game not found"); onLeave(); return; }
      setGame(g as never);
      setPlayers((pl ?? []) as never);
      const ids = (pl ?? []).map(p => p.user_id);
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, avatar_color, avatar_url")
          .in("id", ids);
        if (!cancelled) setProfiles(Object.fromEntries((profs ?? []).map(p => [p.id, p as ProfileRow])));
      }
    }
    load();
    const ch = supabase
      .channel(`game-${gameId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` }, (payload) => {
        setGame(payload.new as never);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "game_players", filter: `game_id=eq.${gameId}` }, () => load())
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const mySeat = useMemo(() => players.find(p => p.user_id === meId)?.seat ?? null, [players, meId]);
  const needed = game ? (LUDO_SEATS_FOR_TYPE[game.game_type] ?? 2) : 2;
  const state: LudoState = (game?.state && Object.keys(game.state).length)
    ? (game.state as LudoState)
    : initLudoState(needed);
  const myTurn = mySeat != null && game?.current_turn_seat === mySeat && game.status === "active";

  async function handleRoll() {
    setPending(true);
    try { await roll({ data: { gameId } }); }
    catch (e) { toast.error((e as Error).message); }
    finally { setPending(false); }
  }
  async function handleMove(tokenIdx: number) {
    setPending(true);
    try { await move({ data: { gameId, tokenIndex: tokenIdx } }); }
    catch (e) { toast.error((e as Error).message); }
    finally { setPending(false); }
  }
  async function handleLeave() {
    if (!confirm(game?.status === "active" ? "Forfeit this match?" : "Leave this match?")) return;
    try { await leave({ data: { gameId } }); } catch {}
    onLeave();
  }

  if (!game) return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Loading…</div>;

  const winner = game.winner_id ? profiles[game.winner_id] : null;

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button onClick={onLeave} className="rounded-full p-2 hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">Ludo {game.game_type === "ludo_4p" ? "4P" : "1v1"}</h1>
            <p className="text-xs text-muted-foreground">
              {game.status === "waiting" && `Waiting · ${players.length}/${needed} joined`}
              {game.status === "active" && `Turn: ${SEAT_NAMES[game.current_turn_seat]}`}
              {game.status === "finished" && `🏆 Winner: ${winner?.username || "—"}`}
              {game.status === "cancelled" && "Cancelled"}
            </p>
          </div>
          <button onClick={handleLeave} className="rounded-full bg-destructive/15 p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground" title="Leave">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-5">
        {/* Players strip */}
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: needed }, (_, seat) => {
            const p = players.find(pp => pp.seat === seat);
            const prof = p ? profiles[p.user_id] : null;
            const isTurn = game.status === "active" && game.current_turn_seat === seat;
            return (
              <div
                key={seat}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${isTurn ? "border-primary bg-primary/10 shadow" : "border-border bg-card"}`}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: SEAT_COLORS[seat] }} />
                <span className="font-semibold">{prof?.username || "—"}</span>
                {p?.user_id === meId && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">YOU</span>}
              </div>
            );
          })}
          {game.status === "waiting" && players.length < needed && (
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1 rounded-full border border-dashed border-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="h-3 w-3" /> Invite
            </button>
          )}
        </div>

        {/* Board */}
        {game.status !== "waiting" && (
          <div className="rounded-2xl border border-border bg-card p-3">
            <LudoBoard
              state={state}
              mySeat={mySeat}
              currentTurnSeat={game.current_turn_seat}
              seats={needed}
              onMoveToken={handleMove}
              pending={pending}
            />
          </div>
        )}

        {/* Dice / status */}
        {game.status === "active" && (
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{state.lastEvent}</div>
            <div className="flex items-center justify-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-border bg-background text-3xl font-bold shadow-inner">
                {state.dice ?? "—"}
              </div>
              <button
                onClick={handleRoll}
                disabled={!myTurn || state.dice != null || pending}
                className="rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Dice5 className="mr-2 inline h-5 w-5" />
                {myTurn ? (state.dice != null ? "Pick a token" : "Roll dice") : "Waiting…"}
              </button>
            </div>
            {!myTurn && <p className="mt-3 text-xs text-muted-foreground">It's {SEAT_NAMES[game.current_turn_seat]}'s turn.</p>}
          </div>
        )}

        {game.status === "waiting" && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <Users className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-semibold">Waiting for opponents to join…</p>
            <p className="mt-1 text-xs text-muted-foreground">Share this page or invite a friend. The match will auto-start when full.</p>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }}
              className="mt-3 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary-foreground hover:opacity-90"
            >
              Copy invite link
            </button>
          </div>
        )}

        {game.status === "finished" && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-center">
            <Trophy className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-2 text-base font-bold">{winner?.username || "Someone"} wins!</p>
            <Link to="/games" search={{}} className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back to lobby</Link>
          </div>
        )}
      </div>

      <InviteFriendsDialog
        open={inviteOpen}
        gameId={gameId}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
