import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import {
  listSafetyEvents,
  getSafetyOverview,
  resolveSafetyEvent,
  listSafetyKeywords,
  addSafetyKeyword,
  toggleSafetyKeyword,
  removeSafetyKeyword,
} from "@/lib/moderation.functions";

export const Route = createFileRoute("/admin/safety")({
  head: () => ({
    meta: [
      { title: "Safety Review — Admin" },
      { name: "description", content: "Review flagged messages, manage safety keyword rules and safety enforcement." },
    ],
  }),
  component: SafetyPage,
});

const SEV_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "Suspicious", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  2: { label: "High risk", color: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  3: { label: "Imminent", color: "bg-red-500/15 text-red-600 border-red-500/30" },
};

function SafetyPage() {
  const router = useRouter();
  const listFn = useServerFn(listSafetyEvents);
  const overviewFn = useServerFn(getSafetyOverview);
  const resolveFn = useServerFn(resolveSafetyEvent);
  const listKw = useServerFn(listSafetyKeywords);
  const addKw = useServerFn(addSafetyKeyword);
  const toggleKw = useServerFn(toggleSafetyKeyword);
  const removeKw = useServerFn(removeSafetyKeyword);

  const [status, setStatus] = useState<"pending" | "all" | "kept_blocked" | "false_positive" | "escalated" | "approved">("pending");

  const overview = useQuery({ queryKey: ["safety-overview"], queryFn: () => overviewFn() });
  const events = useQuery({
    queryKey: ["safety-events", status],
    queryFn: () => listFn({ data: { status, limit: 100 } }),
  });
  const keywords = useQuery({ queryKey: ["safety-keywords"], queryFn: () => listKw() });

  async function resolve(id: string, next: "approved" | "kept_blocked" | "false_positive" | "escalated") {
    try {
      await resolveFn({ data: { id, status: next } });
      toast.success("Safety event updated");
      events.refetch();
      overview.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Safety Review"
        description="Automated detection of illegal, violent or extremist content. Review flagged messages and manage keyword rules."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Pending review" value={overview.data?.pending ?? "—"} tone="warn" />
        <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="Imminent threats (24h)" value={overview.data?.imminent24h ?? "—"} tone="danger" />
        <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Blocked (24h)" value={overview.data?.blocked24h ?? "—"} tone="info" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Flagged messages</CardTitle>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="kept_blocked">Kept blocked</SelectItem>
              <SelectItem value="false_positive">False positive</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {events.data?.length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No events.</div>
          )}
          {events.data?.map((e) => {
            const sev = SEV_LABEL[e.severity] ?? SEV_LABEL[1];
            return (
              <div key={e.id} className="rounded-lg border bg-card/40 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={sev.color}>L{e.severity} · {sev.label}</Badge>
                  <Badge variant="outline">{e.category}</Badge>
                  <Badge variant="secondary">{e.action}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                </div>
                <div className="rounded bg-muted/40 p-2 text-sm font-mono break-words">{e.message_text}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Channel: <span className="font-mono">{e.channel_id ?? "—"}</span> · User: <span className="font-mono">{e.user_id?.slice(0, 8) ?? "—"}</span>
                  {e.matched_pattern && <> · Pattern: <span className="font-mono">{e.matched_pattern}</span></>}
                </div>
                {e.status === "pending" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="destructive" onClick={() => resolve(e.id, "kept_blocked")}>Keep blocked</Button>
                    <Button size="sm" variant="outline" onClick={() => resolve(e.id, "false_positive")}>False positive</Button>
                    <Button size="sm" variant="outline" onClick={() => resolve(e.id, "escalated")}>Escalate</Button>
                    <Button size="sm" variant="ghost" onClick={() => resolve(e.id, "approved")}>Approve</Button>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-muted-foreground">Reviewed: {e.status}{e.reviewer_note ? ` — ${e.reviewer_note}` : ""}</div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <KeywordsPanel
        keywords={keywords.data ?? []}
        onAdd={async (payload) => {
          try {
            await addKw({ data: payload });
            toast.success("Keyword added");
            keywords.refetch();
          } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
        }}
        onToggle={async (id, active) => {
          await toggleKw({ data: { id, active } });
          keywords.refetch();
        }}
        onRemove={async (id) => {
          if (!confirm("Delete this keyword rule?")) return;
          await removeKw({ data: { id } });
          keywords.refetch();
        }}
      />

      <Textarea readOnly value="Level 1: silently logged for review. Level 2: message blocked + sender auto-muted 1h. Level 3: message blocked + sender chat-suspended 24h. Enforcement runs inside the database, so no client can bypass it." className="bg-muted/30 text-xs" rows={3} />
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number | string; tone: "warn" | "danger" | "info" }) {
  const toneClass =
    tone === "danger" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-primary";
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 place-items-center rounded-md bg-muted/50 ${toneClass}`}>{icon}</div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`text-2xl font-semibold ${toneClass}`}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KwRow {
  id: string;
  pattern: string;
  category: string;
  severity: number;
  match_mode: string;
  active: boolean;
  notes: string | null;
}

function KeywordsPanel({
  keywords, onAdd, onToggle, onRemove,
}: {
  keywords: KwRow[];
  onAdd: (p: { pattern: string; match_mode: "word" | "substring" | "regex"; category: "violent_crime" | "terrorism" | "illegal_coordination" | "threats" | "dangerous_instructions" | "self_harm"; severity: number; notes?: string }) => Promise<void>;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [pattern, setPattern] = useState("");
  const [category, setCategory] = useState<"violent_crime" | "terrorism" | "illegal_coordination" | "threats" | "dangerous_instructions" | "self_harm">("threats");
  const [severity, setSeverity] = useState<number>(2);
  const [matchMode, setMatchMode] = useState<"word" | "substring" | "regex">("substring");

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Keyword rules</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_140px_120px_120px_auto]">
          <Input placeholder="Pattern or phrase" value={pattern} onChange={(e) => setPattern(e.target.value)} />
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="violent_crime">Violent crime</SelectItem>
              <SelectItem value="terrorism">Terrorism</SelectItem>
              <SelectItem value="illegal_coordination">Illegal coord.</SelectItem>
              <SelectItem value="threats">Threats</SelectItem>
              <SelectItem value="dangerous_instructions">Dangerous instr.</SelectItem>
              <SelectItem value="self_harm">Self-harm</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(severity)} onValueChange={(v) => setSeverity(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">L1 · log</SelectItem>
              <SelectItem value="2">L2 · block+mute</SelectItem>
              <SelectItem value="3">L3 · block+suspend</SelectItem>
            </SelectContent>
          </Select>
          <Select value={matchMode} onValueChange={(v) => setMatchMode(v as typeof matchMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="substring">Substring</SelectItem>
              <SelectItem value="word">Whole word</SelectItem>
              <SelectItem value="regex">Regex</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={async () => {
              if (pattern.trim().length < 2) return;
              await onAdd({ pattern: pattern.trim(), category, severity, match_mode: matchMode });
              setPattern("");
            }}
          >Add</Button>
        </div>
        <div className="max-h-[420px] space-y-2 overflow-y-auto">
          {keywords.map((k) => (
            <div key={k.id} className="flex items-center gap-2 rounded border p-2 text-sm">
              <Badge variant="outline" className={SEV_LABEL[k.severity]?.color}>L{k.severity}</Badge>
              <Badge variant="secondary">{k.category}</Badge>
              <Badge variant="outline">{k.match_mode}</Badge>
              <span className="flex-1 font-mono break-words">{k.pattern}</span>
              <Button size="sm" variant={k.active ? "secondary" : "outline"} onClick={() => onToggle(k.id, !k.active)}>
                {k.active ? "Active" : "Off"}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onRemove(k.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
