import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Share2, Flame, EyeOff, Send, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/chat/Avatar";
import { REACTION_EMOJI, REACTION_ORDER, type FeedPost, type FeedComment, type FeedReaction, type ReactionType } from "@/lib/feed-types";
import { postSlug } from "@/lib/post-slug";
import { ShareModal, type SharePayload } from "@/components/feed/ShareModal";
import type { User } from "@/lib/chat-types";
import { NameEmojiBadge } from "@/lib/name-emoji";


function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function PostCard({
  post,
  profiles,
  meId,
}: {
  post: FeedPost;
  profiles: Record<string, User>;
  meId: string;
}) {
  const [reactions, setReactions] = useState<FeedReaction[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState<SharePayload | null>(null);


  const author = post.is_anonymous ? null : profiles[post.author_id];
  const myReaction = reactions.find((r) => r.user_id === meId);
  const counts: Partial<Record<ReactionType, number>> = {};
  for (const r of reactions) counts[r.type] = (counts[r.type] ?? 0) + 1;

  useEffect(() => {
    supabase.from("reactions").select("*").eq("target_type", "post").eq("target_id", post.id)
      .then(({ data }) => setReactions((data ?? []) as FeedReaction[]));
    const ch = supabase.channel(`post-r-${post.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions", filter: `target_id=eq.${post.id}` }, (payload) => {
        if (payload.eventType === "INSERT") setReactions((p) => [...p, payload.new as FeedReaction]);
        if (payload.eventType === "DELETE") setReactions((p) => p.filter((x) => x.id !== (payload.old as FeedReaction).id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [post.id]);

  useEffect(() => {
    if (!showComments) return;
    supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true })
      .then(({ data }) => setComments((data ?? []) as FeedComment[]));
    const ch = supabase.channel(`post-c-${post.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${post.id}` }, (payload) => {
        if (payload.eventType === "INSERT") setComments((p) => [...p, payload.new as FeedComment]);
        if (payload.eventType === "DELETE") setComments((p) => p.filter((c) => c.id !== (payload.old as FeedComment).id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [showComments, post.id]);

  async function react(type: ReactionType) {
    setPickerOpen(false);
    if (myReaction?.type === type) {
      await supabase.from("reactions").delete().eq("id", myReaction.id);
      return;
    }
    if (myReaction) await supabase.from("reactions").delete().eq("id", myReaction.id);
    await supabase.from("reactions").insert({ user_id: meId, target_type: "post", target_id: post.id, type });
  }

  async function addComment() {
    if (!commentText.trim()) return;
    setSending(true);
    await supabase.from("comments").insert({ post_id: post.id, author_id: meId, text: commentText.trim() });
    setCommentText("");
    setSending(false);
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
    <article className="rounded-3xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <header className="flex items-center gap-3">
        {author ? (
          <Link to="/u/$username" params={{ username: author.name }}>
            <Avatar user={author} size={40} />
          </Link>
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground"><EyeOff className="h-5 w-5" /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {author ? (
              <>
                <Link to="/u/$username" params={{ username: author.name }} className="font-semibold hover:underline">{author.name}</Link>
                <NameEmojiBadge user={author} />
              </>
            ) : (
              <span className="font-semibold text-muted-foreground">Anonymous</span>
            )}
            {post.trending_score > 50 && <Flame className="h-3.5 w-3.5 text-orange-500" />}
          </div>
          <div className="text-xs text-muted-foreground">
            <Link to="/feed/$slug" params={{ slug: postSlug(post) }} className="hover:underline">{timeAgo(post.created_at)}</Link> · <span className="capitalize">{post.privacy}</span>
          </div>
        </div>
        {post.author_id === meId && (
          <button onClick={del} className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {post.text && <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{renderText(post.text)}</p>}

      {post.media_urls.length > 0 && (
        <div className={`mt-3 grid gap-1 overflow-hidden rounded-2xl ${post.media_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media_urls.map((u, i) => (
            <img key={i} src={u} alt="" loading="lazy" className="max-h-96 w-full object-cover" />
          ))}
        </div>
      )}

      <footer className="mt-3 flex items-center gap-1 border-t border-border pt-2">
        <div className="relative">
          <button
            onClick={() => setPickerOpen(!pickerOpen)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${myReaction ? "text-primary" : "text-muted-foreground"} hover:bg-accent hover:text-foreground`}
          >
            <span className="text-base">{myReaction ? REACTION_EMOJI[myReaction.type] : "👍"}</span>
            <span>{reactions.length || "React"}</span>
          </button>
          {pickerOpen && (
            <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-full border border-border bg-card p-1 shadow-lg">
              {REACTION_ORDER.map((r) => (
                <button key={r} onClick={() => react(r)} className="rounded-full p-1.5 text-lg transition-transform hover:scale-125">
                  {REACTION_EMOJI[r]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setShowComments(!showComments)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <MessageCircle className="h-4 w-4" /> {post.comment_count || "Comment"}
        </button>
        <button
          onClick={async () => {
            const url = `${window.location.origin}/feed/${postSlug(post)}`;
            const authorName = author?.name ?? "Anonymous";
            const title = post.text
              ? `${authorName}: ${post.text.slice(0, 60)}${post.text.length > 60 ? "…" : ""}`
              : `${authorName} on Palrgo`;
            const shareText = post.text ? post.text : `Check out this post by ${authorName}`;
            const payload: SharePayload = { title, text: shareText, url };
            // Try native Web Share API first (best on mobile)
            if (typeof navigator !== "undefined" && navigator.share) {
              try {
                await navigator.share({ title, text: shareText, url });
                return;
              } catch (e) {
                if ((e as Error)?.name === "AbortError") return;
                // fall through to modal
              }
            }
            setShareOpen(payload);
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </footer>
      {shareOpen && <ShareModal payload={shareOpen} onClose={() => setShareOpen(null)} />}


      {Object.keys(counts).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
          {(Object.entries(counts) as [ReactionType, number][]).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5">{REACTION_EMOJI[k]} {v}</span>
          ))}
        </div>
      )}

      {showComments && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {comments.map((c) => {
            const cAuthor = profiles[c.author_id];
            return (
              <div key={c.id} className="flex gap-2">
                {cAuthor && <Avatar user={cAuthor} size={28} />}
                <div className="min-w-0 flex-1 rounded-2xl bg-accent/50 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">{cAuthor?.name ?? "user"}</span>
                    <span className="text-muted-foreground">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm">{c.text}</p>
                </div>
              </div>
            );
          })}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
              placeholder="Write a comment…"
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={addComment} disabled={sending || !commentText.trim()} className="rounded-full bg-primary p-2 text-primary-foreground disabled:opacity-50">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
