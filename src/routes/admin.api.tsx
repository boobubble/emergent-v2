import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, KeyRound, Plus, RefreshCw, Send, Trash2, Webhook } from "lucide-react";
import {
  listApiKeys, createApiKey, revokeApiKey, deleteApiKey,
  listWebhooks, createWebhook, updateWebhook, deleteWebhook,
  rotateWebhookSecret, testWebhook, getWebhookSecret, listDeliveries,
  WEBHOOK_EVENTS,
} from "@/lib/api-webhooks.functions";

export const Route = createFileRoute("/admin/api")({ component: ApiPage });

function copy(text: string, label = "Copied") {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
}

function ApiPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="API & Webhooks" description="Outbound webhooks and API keys. Super admin only." />
      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys"><KeyRound className="mr-2 h-4 w-4" />API keys</TabsTrigger>
          <TabsTrigger value="hooks"><Webhook className="mr-2 h-4 w-4" />Webhooks</TabsTrigger>
        </TabsList>
        <TabsContent value="keys" className="mt-4"><ApiKeysPanel /></TabsContent>
        <TabsContent value="hooks" className="mt-4"><WebhooksPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- API KEYS ---------------- */
function ApiKeysPanel() {
  const list = useServerFn(listApiKeys);
  const create = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);
  const del = useServerFn(deleteApiKey);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["api_keys"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () => create({ data: { name } }),
    onSuccess: (res) => {
      setNewKey(res.key); setName("");
      qc.invalidateQueries({ queryKey: ["api_keys"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const revokeMut = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => { toast.success("Revoked"); qc.invalidateQueries({ queryKey: ["api_keys"] }); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["api_keys"] }); },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">API keys</CardTitle>
        <Button size="sm" onClick={() => { setNewKey(null); setOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" />New key
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
          data.length === 0 ? <div className="text-sm text-muted-foreground">No API keys yet.</div> :
          <div className="divide-y divide-border">
            {data.map((k: any) => (
              <div key={k.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{k.name}</span>
                    {k.revoked_at && <Badge variant="destructive">revoked</Badge>}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{k.key_prefix}…</div>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                  </div>
                </div>
                {!k.revoked_at && (
                  <Button size="sm" variant="outline" onClick={() => revokeMut.mutate(k.id)}>Revoke</Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => delMut.mutate(k.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        }
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{newKey ? "API key created" : "New API key"}</DialogTitle></DialogHeader>
          {newKey ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Copy now — you won't see it again.</p>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2">
                <code className="flex-1 truncate font-mono text-xs">{newKey}</code>
                <Button size="icon" variant="ghost" onClick={() => copy(newKey)}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mobile app" />
            </div>
          )}
          <DialogFooter>
            {newKey
              ? <Button onClick={() => setOpen(false)}>Done</Button>
              : <Button onClick={() => createMut.mutate()} disabled={!name.trim() || createMut.isPending}>Create</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ---------------- WEBHOOKS ---------------- */
function WebhooksPanel() {
  const list = useServerFn(listWebhooks);
  const create = useServerFn(createWebhook);
  const update = useServerFn(updateWebhook);
  const del = useServerFn(deleteWebhook);
  const rotate = useServerFn(rotateWebhookSecret);
  const test = useServerFn(testWebhook);
  const getSecret = useServerFn(getWebhookSecret);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["webhooks"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", events: [] as string[] });
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["webhooks"] });

  const createMut = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: (r) => { setCreatedSecret(r.secret); setForm({ name: "", url: "", events: [] }); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Outbound webhooks</CardTitle>
        <Button size="sm" onClick={() => { setCreatedSecret(null); setOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" />New webhook
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> :
          data.length === 0 ? <div className="text-sm text-muted-foreground">No webhooks configured.</div> :
          <div className="space-y-3">
            {data.map((w: any) => (
              <WebhookRow
                key={w.id} w={w}
                onToggle={(active) => update({ data: { id: w.id, active } }).then(refresh)}
                onDelete={() => del({ data: { id: w.id } }).then(() => { toast.success("Deleted"); refresh(); })}
                onRotate={async () => { const r = await rotate({ data: { id: w.id } }); copy(r.secret, "New secret copied"); }}
                onTest={async () => {
                  const r = await test({ data: { id: w.id } });
                  toast[r.ok ? "success" : "error"](r.ok ? `Delivered (${r.status})` : `Failed: ${r.error ?? r.status}`);
                  refresh();
                }}
                onShowSecret={async () => { const r = await getSecret({ data: { id: w.id } }); copy(r.secret, "Secret copied"); }}
              />
            ))}
          </div>
        }
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{createdSecret ? "Webhook created" : "New webhook"}</DialogTitle></DialogHeader>
          {createdSecret ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Signing secret — copy now. Verify with <code>sha256(secret + body)</code> in the <code>x-webhook-signature</code> header.
              </p>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2">
                <code className="flex-1 truncate font-mono text-xs">{createdSecret}</code>
                <Button size="icon" variant="ghost" onClick={() => copy(createdSecret)}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Zapier — new posts" />
              </div>
              <div>
                <Label>URL</Label>
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/hook" />
              </div>
              <div>
                <Label>Events</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {WEBHOOK_EVENTS.map((ev) => {
                    const checked = form.events.includes(ev);
                    return (
                      <label key={ev} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                        <Checkbox checked={checked} onCheckedChange={(v) => {
                          setForm({ ...form, events: v
                            ? [...form.events, ev]
                            : form.events.filter((e) => e !== ev) });
                        }} />
                        <code className="text-xs">{ev}</code>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {createdSecret
              ? <Button onClick={() => setOpen(false)}>Done</Button>
              : <Button onClick={() => createMut.mutate()} disabled={!form.name.trim() || !form.url.trim() || createMut.isPending}>Create</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function WebhookRow({ w, onToggle, onDelete, onRotate, onTest, onShowSecret }: {
  w: any;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
  onRotate: () => void;
  onTest: () => void;
  onShowSecret: () => void;
}) {
  const listDel = useServerFn(listDeliveries);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [showLog, setShowLog] = useState(false);
  useEffect(() => {
    if (showLog) listDel({ data: { endpoint_id: w.id } }).then(setDeliveries);
  }, [showLog, w.id, listDel]);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{w.name}</span>
            {w.last_status != null && (
              <Badge variant={w.last_status >= 200 && w.last_status < 300 ? "default" : "destructive"}>
                {w.last_status}
              </Badge>
            )}
          </div>
          <div className="truncate font-mono text-xs text-muted-foreground">{w.url}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {(w.events ?? []).map((e: string) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={!!w.active} onCheckedChange={onToggle} />
          <Button size="sm" variant="outline" onClick={onTest}><Send className="mr-1 h-3.5 w-3.5" />Test</Button>
          <Button size="sm" variant="outline" onClick={onShowSecret}><Copy className="mr-1 h-3.5 w-3.5" />Secret</Button>
          <Button size="sm" variant="outline" onClick={onRotate}><RefreshCw className="mr-1 h-3.5 w-3.5" />Rotate</Button>
          <Button size="icon" variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <button type="button" className="mt-2 text-xs text-primary hover:underline" onClick={() => setShowLog((s) => !s)}>
        {showLog ? "Hide" : "Show"} recent deliveries
      </button>
      {showLog && (
        <div className="mt-2 space-y-1 text-xs">
          {deliveries.length === 0 ? <div className="text-muted-foreground">No deliveries yet.</div> :
            deliveries.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded border border-border/60 px-2 py-1">
                <span>{d.event}</span>
                <span className={d.ok ? "text-emerald-500" : "text-red-500"}>
                  {d.status_code ?? "—"} · {new Date(d.created_at).toLocaleString()}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
