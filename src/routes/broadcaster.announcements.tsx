import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  listWidgets,
} from "@/lib/broadcaster.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pin, PinOff, Trash2, Megaphone } from "lucide-react";

export const Route = createFileRoute("/broadcaster/announcements")({
  component: AnnouncementsPage,
});

type Kind = "upcoming_show" | "ticker" | "community";

const KIND_LABEL: Record<Kind, string> = {
  upcoming_show: "Upcoming Show",
  ticker: "Ticker",
  community: "Community",
};

function AnnouncementsPage() {
  const qc = useQueryClient();
  const fetchAnnouncements = useServerFn(listAnnouncements);
  const fetchWidgets = useServerFn(listWidgets);
  const create = useServerFn(createAnnouncement);
  const update = useServerFn(updateAnnouncement);
  const remove = useServerFn(deleteAnnouncement);

  const [kind, setKind] = useState<Kind>("upcoming_show");
  const list = useQuery({
    queryKey: ["broadcaster-announcements", kind],
    queryFn: () => fetchAnnouncements({ data: { kind } }),
  });
  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Announcements</h1>
      </div>

      <Tabs value={kind} onValueChange={(v) => setKind(v as Kind)}>
        <TabsList>
          <TabsTrigger value="upcoming_show">Upcoming Show</TabsTrigger>
          <TabsTrigger value="ticker">Ticker</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>
        {(["upcoming_show", "ticker", "community"] as Kind[]).map((k) => (
          <TabsContent key={k} value={k} className="space-y-4">
            <CreateForm
              kind={k}
              widgets={widgets.data ?? []}
              onCreate={(payload) =>
                create({ data: { ...payload, kind: k } as never }).then(() => {
                  qc.invalidateQueries({ queryKey: ["broadcaster-announcements", k] });
                  toast.success("Posted");
                }).catch((e: Error) => toast.error(e.message))
              }
            />
            <div className="space-y-2">
              {(list.data ?? []).map((a) => (
                <Card key={a.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline">{KIND_LABEL[a.kind as Kind] ?? a.kind}</Badge>
                        {a.pinned && <Badge>Pinned</Badge>}
                        {!a.active && <Badge variant="secondary">Disabled</Badge>}
                      </span>
                      <span className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => {
                          update({ data: { id: a.id, pinned: !a.pinned } }).then(() =>
                            qc.invalidateQueries({ queryKey: ["broadcaster-announcements", k] }));
                        }}>
                          {a.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => {
                          if (confirm("Delete announcement?"))
                            remove({ data: { id: a.id } }).then(() =>
                              qc.invalidateQueries({ queryKey: ["broadcaster-announcements", k] }));
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-medium">{a.title}</div>
                    {a.body && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</div>}
                    {a.link && <a href={a.link} className="text-xs text-primary" target="_blank" rel="noreferrer">{a.link}</a>}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <label className="inline-flex items-center gap-1">
                        <Switch
                          checked={a.active}
                          onCheckedChange={(v) => update({ data: { id: a.id, active: v } }).then(() =>
                            qc.invalidateQueries({ queryKey: ["broadcaster-announcements", k] }))}
                        />
                        Active
                      </label>
                      {a.widget_id && <span>widget-scoped</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(list.data ?? []).length === 0 && (
                <div className="text-sm text-muted-foreground">No {KIND_LABEL[k].toLowerCase()} announcements yet.</div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function CreateForm({
  kind,
  widgets,
  onCreate,
}: {
  kind: Kind;
  widgets: Array<{ id: string; name: string }>;
  onCreate: (p: {
    title: string;
    body?: string | null;
    link?: string | null;
    widget_id?: string | null;
    pinned?: boolean;
    target?: { widget?: boolean; chatbar?: boolean; notifications?: boolean; feed?: boolean };
  }) => Promise<void> | void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [widgetId, setWidgetId] = useState<string>("__global__");
  const [pinned, setPinned] = useState(false);
  const [target, setTarget] = useState({ widget: true, chatbar: true, notifications: true, feed: true });

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">New {KIND_LABEL[kind].toLowerCase()}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Body (optional)" value={body} onChange={(e) => setBody(e.target.value)} />
        <Input placeholder="Link (optional)" value={link} onChange={(e) => setLink(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-2">
          <Select value={widgetId} onValueChange={setWidgetId}>
            <SelectTrigger><SelectValue placeholder="Scope" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__global__">Global (all widgets)</SelectItem>
              {widgets.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <label className="inline-flex items-center gap-2 text-sm">
            <Switch checked={pinned} onCheckedChange={setPinned} /> Pin to top
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {(["widget", "chatbar", "notifications", "feed"] as const).map((t) => (
            <label key={t} className="inline-flex items-center gap-2">
              <Switch
                checked={target[t]}
                onCheckedChange={(v) => setTarget((s) => ({ ...s, [t]: v }))}
              />
              {t}
            </label>
          ))}
        </div>
        <Button
          disabled={!title.trim()}
          onClick={async () => {
            await onCreate({
              title,
              body: body || null,
              link: link || null,
              widget_id: widgetId === "__global__" ? null : widgetId,
              pinned,
              target,
            });
            setTitle(""); setBody(""); setLink(""); setPinned(false);
          }}
        >
          Post
        </Button>
      </CardContent>
    </Card>
  );
}
