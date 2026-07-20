import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { followWriter, unfollowWriter, isFollowingWriter } from "@/lib/poetry-social.functions";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";

interface Props {
  writerId: string;
  writerName?: string;
  variant?: "default" | "compact";
  onChange?: (following: boolean) => void;
}

/**
 * One-way follow control for a writer. Uses the poetry_writer_follows graph
 * (separate from friendships). Renders nothing when viewing self.
 */
export function FollowWriterButton({ writerId, writerName, variant = "default", onChange }: Props) {
  const { user } = useAuth();
  const gate = useAuthGate();
  const follow = useServerFn(followWriter);
  const unfollow = useServerFn(unfollowWriter);
  const check = useServerFn(isFollowingWriter);

  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || user.id === writerId) { setFollowing(null); return; }
    let cancelled = false;
    check({ data: { writerId } })
      .then((r) => { if (!cancelled) setFollowing(!!r.following); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, writerId, check]);

  if (!writerId || user?.id === writerId) return null;

  const onClick = () => {
    if (!user) { gate.openSignIn(); return; }
    if (busy) return;
    setBusy(true);
    const wasFollowing = !!following;
    setFollowing(!wasFollowing);
    const call = wasFollowing ? unfollow({ data: { writerId } }) : follow({ data: { writerId } });
    call
      .then(() => {
        onChange?.(!wasFollowing);
        toast.success(wasFollowing ? "Unfollowed" : `Following${writerName ? " " + writerName : ""}`);
      })
      .catch((e: any) => {
        setFollowing(wasFollowing);
        toast.error(e?.message ?? "Couldn't update follow");
      })
      .finally(() => setBusy(false));
  };

  const isFollowing = !!following;
  const label = following === null
    ? (user ? "Follow" : "Follow")
    : isFollowing ? "Following" : "Follow";
  const Icon = isFollowing ? UserCheck : UserPlus;

  if (variant === "compact") {
    return (
      <button
        onClick={onClick} disabled={busy}
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
      onClick={onClick} disabled={busy}
      aria-pressed={isFollowing}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        isFollowing ? "border border-border bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
