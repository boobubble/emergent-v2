import { memo, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Share2, Flame, EyeOff, Send, Loader2, Trash2, Smile, Rocket } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { FrameAvatar, CosmeticName, RankChip } from "@/components/cosmetics/CosmeticBits";
import { REACTION_EMOJI, REACTION_ORDER, type FeedPost, type FeedComment, type FeedReaction, type ReactionType } from "@/lib/feed-types";
import { postSlug } from "@/lib/post-slug";
import { ShareModal, type SharePayload } from "@/components/feed/ShareModal";
import { PollBlock } from "@/components/feed/PollBlock";
import type { User } from "@/lib/chat-types";
import { NameEmojiBadge } from "@/lib/name-emoji";
import { useFeedPrefs } from "@/lib/feed-prefs";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { earnFeedReaction, earnFeedComment, earnFeedShare, boostPost } from "@/lib/economy.functions";
import { claimShareReward } from "@/lib/boobubble.functions";
import { SPEND } from "@/lib/economy-config";


function timeAgo(iso: string) {
  const time = new Date(iso).getTime();
  const d = Number.isFinite(time) ? Date.now() - time : 0;
  const m = Math.floor(d / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export const PostCard = memo(function PostCard({
  post,
  profiles,
  meId,
}: {
  post: FeedPost;
  profiles: Record<string, User>;
  meId: string;
}) {
  const { prefs } = useFeedPrefs();
  const compact = prefs.compactCards;
  const hideCounts = prefs.hideCounts;
  const [reactions, setReactions] = useState<FeedReaction[]>([]);
  const [reactionsLoaded, setReactionsLoaded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState<SharePayload | null>(null);
  const [boosting, setBoosting] = useState(false);

  const earnReaction = useServerFn(earnFeedReaction);
  const earnComment = useServerFn(earnFeedComment);
  const earnShare = useServerFn(earnFeedShare);
  const doBoost = useServerFn(boostPost);

  const author = post.is_anonymous ? null : profiles[post.author_id];
  const mediaUrls = Array.isArray(post.media_urls) ? post.media_urls : [];
  const reactionCount = post.reaction_count ?? 0;
  const commentCount = post.comment_count ?? 0;
  const trendingScore = post.trending_score ?? 0;
  const myReaction = reactions.find((r) => r.user_id === meId);
  const counts: Partial<Record<ReactionType, number>> = {};
  for (const r of reactions) counts[r.type] = (counts[r.type] ?? 0) + 1;
  const totalReactions = reactionsLoaded ? reactions.length : reactionCount;

  // Lazy: only load detailed reactions when user opens picker or reacts.
  // Live counts come from feed-level `posts` subscription via post.reaction_count.
  async function ensureReactions() {
    if (reactionsLoaded) return;
    const { data } = await supabase.from("reactions").select("*")
      .eq("target_type", "post").eq("target_id", post.id);
    setReactions((data ?? []) as FeedReaction[]);
    setReactionsLoaded(true);
  }

  useEffect(() => {
    if (!showComments) return;
    let cancelled = false;
    supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true })
      .then(({ data }) => { if (!cancelled) setComments((data ?? []) as FeedComment[]); });
    const ch = supabase.channel(`post-c-${post.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${post.id}` }, (payload) => {
        if (payload.eventType === "INSERT") setComments((p) => [...p, payload.new as FeedComment]);
        if (payload.eventType === "DELETE") setComments((p) => p.filter((c) => c.id !== (payload.old as FeedComment).id));
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [showComments, post.id]);

  async function react(type: ReactionType) {
    setPickerOpen(false);
    await ensureReactions();
    const existing = reactions.find((r) => r.user_id === meId);
    if (existing?.type === type) {
      setReactions((p) => p.filter((r) => r.id !== existing.id));
      await supabase.from("reactions").delete().eq("id", existing.id);
      return;
    }
    if (existing) {
      setReactions((p) => p.filter((r) => r.id !== existing.id));
      await supabase.from("reactions").delete().eq("id", existing.id);
    }
    const { data } = await supabase.from("reactions")
      .insert({ user_id: meId, target_type: "post", target_id: post.id, type })
      .select().single();
    if (data) {
      setReactions((p) => [...p, data as FeedReaction]);
      earnReaction({ data: { postId: post.id, ownerId: post.owner_id || undefined } }).catch(() => {});
    }
  }

  async function addComment() {
    if (!commentText.trim()) return;
    setSending(true);
    const { error } = await supabase.from("comments").insert({ post_id: post.id, author_id: meId, text: commentText.trim() });
    if (!error) {
      earnComment({ data: { postId: post.id, ownerId: post.owner_id || undefined } }).catch(() => {});
    }
    setCommentText("");
    setSending(false);
  }

  async function boost() {
    if (boosting) return;
    if (!confirm(`Boost this post for ${SPEND.boost_post.coins} coins?`)) return;
    setBoosting(true);
    try {
      await doBoost({ data: { postId: post.id } });
    } catch (e) {
      alert((e as Error).message ?? "Couldn't boost");
    } finally {
      setBoosting(false);
    }
  }

  async function del() {
    if (!confirm("Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", post.id);
  }

  function renderText(t: string) {
    const parts = t.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith("#") && part.length > 1) return <Link key={i} to="/feed" className="text-primary hover:underline">{part}</Link>;
      if (part.startsWith("@") && part.length > 1) return <Link key={i} to="/u/$username" params={{ username: part.slice(1) }} className="text-primary hover:underline">{part}</Link>;
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <article className={`feed-card feed-card-hover ${compact ? "p-4" : "p-5"}`}>
      <header className="flex items-center gap-3">
        {author ? (
          <Link to="/u/$username" params={{ username: author.name }} className="transition hover:scale-[1.04]">
            <FrameAvatar user={author} size={44} />
          </Link>
        ) : (
          <div className="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground"><EyeOff className="h-5 w-5" /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {author ? (
              <>
                <Link to="/u/$username" params={{ username: author.name }} className="font-semibold text-[15px] hover:underline">
                  <CosmeticName userId={author.id} name={author.name} />
                </Link>
                <NameEmojiBadge user={author} />
                <RankChip level={author.level} compact />
              </>
            ) : (
              <span className="font-semibold text-muted-foreground">Anonymous</span>
            )}
            {trendingScore > 50 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-400">
                <Flame className="h-3 w-3" /> Trending
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            <Link to="/feed/$slug" params={{ slug: postSlug(post) }} className="hover:underline">{timeAgo(post.created_at)}</Link> · <span className="capitalize">{post.privacy}</span>
          </div>
        </div>
        {post.owner_id === meId && (
          <button onClick={del} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {post.text && <p className={`mt-4 whitespace-pre-wrap leading-relaxed ${compact ? "text-[14px]" : "text-[15.5px]"}`}>{renderText(post.text)}</p>}

      {post.kind === "poll" && post.poll && <PollBlock post={post} />}

      {mediaUrls.length > 0 && (
        <div className={`mt-4 grid gap-1 overflow-hidden rounded-2xl border border-border ${mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {mediaUrls.map((u, i) => (
            <img key={i} src={u} alt="" loading="lazy" decoding="async" className={`w-full object-cover transition hover:scale-[1.01] ${compact ? "max-h-80" : "max-h-[480px]"}`} />
          ))}
        </div>
      )}

      {!hideCounts && (totalReactions > 0 || commentCount > 0) && (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {Object.keys(counts).length > 0 ? (
              <div className="flex -space-x-1">
                {(Object.entries(counts) as [ReactionType, number][]).slice(0, 3).map(([k]) => (
                  <span key={k} className="grid h-5 w-5 place-items-center rounded-full bg-card ring-2 ring-card text-[12px]">{REACTION_EMOJI[k]}</span>
                ))}
              </div>
            ) : (
              totalReactions > 0 && <span className="text-base">👍</span>
            )}
            {totalReactions > 0 && <span>{totalReactions}</span>}
          </div>
          {commentCount > 0 && <span>{commentCount} {commentCount === 1 ? "comment" : "comments"}</span>}
        </div>
      )}

      <footer className="mt-3 flex items-center gap-1 border-t border-border pt-2">
        <div className="relative flex-1">
          <button
            onClick={() => { ensureReactions(); setPickerOpen(!pickerOpen); }}
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${myReaction ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent/20 hover:text-foreground"}`}
          >
            <span className={`text-lg ${myReaction ? "like-burst" : ""}`}>{myReaction ? REACTION_EMOJI[myReaction.type] : "👍"}</span>
            <span>{hideCounts ? "React" : (myReaction ? "Reacted" : "Like")}</span>
          </button>
          {pickerOpen && (
            <div className="absolute bottom-full left-0 z-10 mb-2 flex gap-1 rounded-full border border-border bg-card p-1.5 shadow-2xl animate-scale-in">
              {REACTION_ORDER.map((r) => (
                <button key={r} onClick={() => react(r)} className="rounded-full p-1.5 text-xl transition-transform hover:scale-150 hover:-translate-y-1">
                  {REACTION_EMOJI[r]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setShowComments(!showComments)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent/20 hover:text-foreground transition">
          <MessageCircle className="h-4 w-4" /> <span>Comment</span>
        </button>
        {post.owner_id !== meId && (
          <button
            onClick={boost}
            disabled={boosting}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500 disabled:opacity-50 transition"
            title={`Boost (${SPEND.boost_post.coins} coins)`}
          >
            {boosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            <span className="hidden sm:inline">Boost</span>
          </button>
        )}
        <button
          onClick={async () => {
            const url = `${window.location.origin}/feed/${postSlug(post)}`;
            const authorName = author?.name ?? "Anonymous";
            const title = post.text
              ? `${authorName}: ${post.text.slice(0, 60)}${post.text.length > 60 ? "…" : ""}`
              : `${authorName} on Palrgo`;
            const shareText = post.text ? post.text : `Check out this post by ${authorName}`;
            const payload: SharePayload = { title, text: shareText, url };
            earnShare({ data: { postId: post.id, ownerId: post.owner_id || undefined } }).catch(() => {});
            if (typeof navigator !== "undefined" && navigator.share) {
              try {
                await navigator.share({ title, text: shareText, url });
                return;
              } catch (e) {
                if ((e as Error)?.name === "AbortError") return;
              }
            }
            setShareOpen(payload);
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent/20 hover:text-foreground transition"
        >
          <Share2 className="h-4 w-4" /> <span>Share</span>
        </button>
      </footer>
      {shareOpen && <ShareModal payload={shareOpen} onClose={() => setShareOpen(null)} />}



      {showComments && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {comments.map((c) => {
            const cAuthor = profiles[c.author_id];
            return (
              <div key={c.id} className="flex gap-2.5 animate-fade-in">
                {cAuthor && <FrameAvatar user={cAuthor} size={32} />}
                <div className="min-w-0 flex-1 rounded-2xl bg-accent/15 border border-border/60 px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-foreground">
                      {cAuthor ? <CosmeticName userId={cAuthor.id} name={cAuthor.name} /> : "user"}
                    </span>
                    <span className="text-muted-foreground">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="mt-0.5 text-[14px] leading-relaxed">{c.text}</p>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 pt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
              placeholder="Write a comment…"
              className="flex-1 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="rounded-full p-2 text-muted-foreground hover:bg-accent/30 hover:text-foreground transition" aria-label="Add emoji">
                  <Smile className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <EmojiPicker onPick={(e) => setCommentText((t) => t + e)} />
              </PopoverContent>
            </Popover>
            <button onClick={addComment} disabled={sending || !commentText.trim()} className="rounded-full bg-gradient-to-r from-primary to-primary/80 p-2.5 text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary-glow)] hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:hover:scale-100">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </article>
  );
});
