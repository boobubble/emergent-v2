import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { toast } from "sonner";
import {
  getDmPrivacy, setDmPrivacy,
  listMessageRequests, respondMessageRequest,
  getTrustScore,
} from "@/lib/trust-safety.functions";
import {
  getMySocialFeaturePref,
  setMySocialFeaturePref,
} from "@/lib/social-automation.functions";
import { Shield, MailWarning, Compass } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/privacy")({
  component: PrivacySettings,
  head: () => ({ meta: [{ title: "Privacy · Settings" }] }),
});

const CHOICES: Array<{ v: "everyone"|"friends"|"nobody"; label: string; desc: string }> = [
  { v: "everyone", label: "Everyone", desc: "Anyone can DM you. Non-friends may appear as message requests." },
  { v: "friends",  label: "Friends only", desc: "Only accepted friends can start a DM." },
  { v: "nobody",   label: "Nobody",  desc: "Nobody can DM you. Existing chats stay open." },
];

function PrivacySettings() {
  const qc = useQueryClient();
  const getFn = useServerFn(getDmPrivacy);
  const setFn = useServerFn(setDmPrivacy);
  const scoreFn = useServerFn(getTrustScore);
  const reqFn = useServerFn(listMessageRequests);
  const respondFn = useServerFn(respondMessageRequest);
  const getSocialFn = useServerFn(getMySocialFeaturePref);
  const setSocialFn = useServerFn(setMySocialFeaturePref);

  const priv = useQuery({ queryKey: ["dm-privacy"], queryFn: () => getFn() });
  const score = useQuery({ queryKey: ["trust-score"], queryFn: () => scoreFn() });
  const requests = useQuery({ queryKey: ["dm-requests"], queryFn: () => reqFn() });
  const socialPref = useQuery({ queryKey: ["social-feature-pref"], queryFn: () => getSocialFn() });

  const choose = async (v: "everyone"|"friends"|"nobody") => {
    try { await setFn({ data: { who_can_dm: v } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["dm-privacy"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };
  const setRequests = async (allow: boolean) => {
    try { await setFn({ data: { who_can_dm: priv.data?.who_can_dm ?? "everyone", allow_message_requests: allow } }); qc.invalidateQueries({ queryKey: ["dm-privacy"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };
  const setSocialFeature = async (allow: boolean) => {
    try {
      await setSocialFn({ data: { allow_social_feature: allow } });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["social-feature-pref"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const respond = async (id: string, action: "accept"|"decline"|"block") => {
    try { await respondFn({ data: { id, action } }); qc.invalidateQueries({ queryKey: ["dm-requests"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy</h1>
        <p className="text-sm text-muted-foreground">Control who can DM you and manage message requests.</p>
        <Link to="/settings/discovery" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <Compass className="h-3.5 w-3.5" /> Content & Discovery settings
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Who can DM you</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {priv.isLoading && <Skeleton className="h-24 w-full" />}
          {priv.data && CHOICES.map((c) => (
            <button key={c.v} onClick={() => choose(c.v)}
              className={`w-full rounded-lg border p-3 text-left transition ${priv.data.who_can_dm === c.v ? "border-primary bg-primary/5" : "hover:bg-muted"}`}>
              <div className="font-medium">{c.label}</div>
              <div className="text-xs text-muted-foreground">{c.desc}</div>
            </button>
          ))}
          {priv.data?.who_can_dm === "everyone" && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div>
                <div className="text-sm font-medium">Allow message requests from non-friends</div>
                <p className="text-xs text-muted-foreground">First message from a non-friend goes to a Requests inbox until you accept.</p>
              </div>
              <AdminToggle checked={priv.data.allow_message_requests ?? true} onCheckedChange={setRequests} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Yaarzo social featuring</CardTitle></CardHeader>
        <CardContent>
          {socialPref.isLoading && <Skeleton className="h-16 w-full" />}
          {socialPref.data && (
            <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3">
              <div>
                <div className="text-sm font-medium">Allow Yaarzo to feature my public profile on Yaarzo social media</div>
                <p className="text-xs text-muted-foreground">
                  When enabled, Yaarzo may share your public username, avatar, and profile link on Yaarzo’s Facebook, X, TikTok, or Instagram accounts. Turn this off anytime.
                </p>
              </div>
              <AdminToggle
                checked={socialPref.data.allow_social_feature}
                onCheckedChange={setSocialFeature}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MailWarning className="h-4 w-4" /> Message Requests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {requests.isLoading && <Skeleton className="h-16 w-full" />}
          {(requests.data ?? []).map((r) => (
            <div key={r.id as string} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">Request from {String(r.sender_id).slice(0, 8)}</div>
                {r.preview && <p className="truncate text-xs text-muted-foreground">"{String(r.preview)}"</p>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => respond(r.id as string, "accept")}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => respond(r.id as string, "decline")}>Decline</Button>
                <Button size="sm" variant="destructive" onClick={() => respond(r.id as string, "block")}>Block</Button>
              </div>
            </div>
          ))}
          {requests.data?.length === 0 && <p className="text-sm text-muted-foreground">No pending requests.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Trust Score</CardTitle></CardHeader>
        <CardContent>
          {score.isLoading && <Skeleton className="h-6 w-32" />}
          {score.data && (
            <div className="text-sm">
              <span className="text-muted-foreground">Current violation points:</span>{" "}
              <span className="font-mono font-bold">{String(score.data.points ?? 0)}</span>
              <p className="mt-1 text-xs text-muted-foreground">Points decay over time. High scores can trigger automatic warnings, mutes, or suspensions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
