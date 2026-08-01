import { useEffect, useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useSocialGraphOptional } from "@/lib/use-social-graph";

interface Props {
  writerId: string;
  writerName?: string;
  variant?: "default" | "compact";
  onChange?: (following: boolean) => void;
}

/**
 * One-way follow control (poetry_writer_follows). Uses the canonical SocialGraph
 * provider when available; falls back to direct Supabase calls otherwise.
 */
export function FollowWriterButton({ writerId, writerName, variant = "default", onChange }: Props) {
  const { user } = useAuth();
  const gate = useAuthGate();
  const social = useSocialGraphOptional();

  const [localFollowing, setLocalFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const followingFromCtx = social?.isFollowing(writerId);
  const following = social ? followingFromCtx : localFollowing;

  useEffect(() => {
    if (social || !user || user.id === writerId) {
      setLocalFollowing(null);
      return;
    }
    let cancelled = false;
    import("@/lib/use-social-graph").then(({ loadFollowingIds }) =>
      loadFollowingIds(user.id).then(({ ids, error }) => {
        if (cancelled || error) return;
        setLocalFollowing(ids.has(writerId));
      }),
    );
    return () => { cancelled = true; };
  }, [social, user?.id, writerId]);

  if (!writerId || user?.id === writerId) return null;

  const onClick = async () => {
    if (!user) { gate.openSignIn(); return; }
    if (busy) return;
    setBusy(true);
    const wasFollowing = !!following;
    try {
      let ok = false;
      let nowFollowing = !wasFollowing;
      if (social) {
        const res = wasFollowing
          ? await social.unfollowWriter(writerId)
          : await social.followWriter(writerId);
        ok = res.ok;
        if (res.ok) nowFollowing = res.following;
        else toast.error(res.error);
      } else {
        const mod = await import("@/lib/use-social-graph");
        const res = wasFollowing
          ? await mod.unfollowWriterClient(user.id, writerId)
          : await mod.followWriterClient(user.id, writerId);
        ok = res.ok;
        if (res.ok) {
          nowFollowing = res.following;
          setLocalFollowing(nowFollowing);
        } else toast.error(res.error);
      }
      if (ok) {
        onChange?.(nowFollowing);
        toast.success(
          nowFollowing
            ? `Following${writerName ? ` ${writerName}` : ""}`
            : "Unfollowed",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const isFollowing = !!following;
  const label = following === null && user ? "Follow" : isFollowing ? "Following" : "Follow";
  const Icon = isFollowing ? UserCheck : UserPlus;

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy || (following === null && !!user)}
        aria-pressed={isFollowing}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
          isFollowing ? "border border-border bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        <Icon className="h-3 w-3" /> {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={busy || (following === null && !!user)}
      aria-pressed={isFollowing}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        isFollowing ? "border border-border bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
