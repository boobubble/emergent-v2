import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldAlert, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readStoredBan, clearStoredBan, type StoredBan } from "@/lib/use-ban-guard";

export const Route = createFileRoute("/banned")({
  component: BannedPage,
  head: () => ({ meta: [{ title: "Account suspended" }] }),
});

function formatRemaining(iso: string | null) {
  if (!iso) return { label: "This ban is permanent.", critical: true };
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { label: "Your ban has just expired — try signing in again.", critical: false };
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return { label: `${mins} minute${mins === 1 ? "" : "s"} remaining`, critical: false };
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) {
    const m = mins % 60;
    return { label: `${hrs}h ${m}m remaining`, critical: false };
  }
  const days = Math.floor(hrs / 24);
  return { label: `${days} day${days === 1 ? "" : "s"} remaining`, critical: false };
}

function BannedPage() {
  const [ban, setBan] = useState<StoredBan | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    setBan(readStoredBan());
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const remaining = formatRemaining(ban?.expires_at ?? null);
  const expired = !!ban?.expires_at && new Date(ban.expires_at).getTime() <= Date.now();

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Your account is suspended</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You've been signed out because a moderator banned this account.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reason
            </div>
            <p className="mt-1 text-sm">
              {ban?.reason?.trim()
                ? ban.reason
                : "No reason was provided by the moderator."}
            </p>
          </div>

          <div className={`flex items-start gap-2 rounded-xl border p-4 ${remaining.critical ? "border-destructive/30 bg-destructive/5" : "bg-muted/30"}`}>
            <Clock className={`mt-0.5 h-4 w-4 ${remaining.critical ? "text-destructive" : "text-muted-foreground"}`} />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duration
              </div>
              <p className="mt-1 text-sm">{remaining.label}</p>
              {ban?.expires_at && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Until {new Date(ban.expires_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          If you believe this is a mistake, contact the moderation team. Creating
          another account to bypass the suspension may result in a permanent ban.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link to="/welcome">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to landing
            </Button>
          </Link>
          {expired && (
            <Link to="/login">
              <Button size="sm" onClick={() => clearStoredBan()}>Try signing in</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
