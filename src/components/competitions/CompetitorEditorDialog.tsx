import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Search, User as UserIcon, X, BadgeCheck } from "lucide-react";
import { adminSaveCompetitor, adminSearchProfiles } from "@/lib/competitions.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface CompetitorDraft {
  id?: string;
  competition_id: string;
  name: string;
  photo_url?: string | null;
  description?: string | null;
  linked_user_id?: string | null;
  sort_order?: number;
  country?: string | null;
  website?: string | null;
  social_links?: Record<string, string | null | undefined> | null;
  is_featured?: boolean;
  is_pinned?: boolean;
  linked_profile?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    avatar_color?: string | null;
    verified?: boolean | null;
  } | null;
}

export function emptyCompetitor(competitionId: string, sortOrder = 0): CompetitorDraft {
  return {
    competition_id: competitionId,
    name: "",
    photo_url: "",
    description: "",
    linked_user_id: null,
    sort_order: sortOrder,
    country: "",
    website: "",
    social_links: {},
    is_featured: false,
    is_pinned: false,
  };
}

type ProfileHit = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
  verified: boolean | null;
};

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function CompetitorEditorDialog({
  value, onChange, invalidateKey,
}: {
  value: CompetitorDraft | null;
  onChange: (v: CompetitorDraft | null) => void;
  invalidateKey: (string | number)[];
}) {
  const save = useServerFn(adminSaveCompetitor);
  const searchFn = useServerFn(adminSearchProfiles);
  const qc = useQueryClient();
  const [draft, setDraft] = useState<CompetitorDraft | null>(value);
  const [tab, setTab] = useState<"user" | "external">(value?.linked_user_id ? "user" : "external");
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 250);

  useEffect(() => {
    setDraft(value);
    setTab(value?.linked_user_id ? "user" : "external");
    setQuery("");
  }, [value]);

  const { data: hits = [], isFetching } = useQuery({
    queryKey: ["admin-profile-search", debounced],
    enabled: tab === "user" && debounced.trim().length >= 2,
    queryFn: () => searchFn({ data: { query: debounced.trim(), limit: 8 } }) as Promise<ProfileHit[]>,
  });

  const m = useMutation({
    mutationFn: (d: CompetitorDraft) => save({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: invalidateKey });
      onChange(null);
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Failed to save";
      toast.error(msg);
    },
  });

  const socials = useMemo(
    () => ({
      twitter: draft?.social_links?.twitter ?? "",
      instagram: draft?.social_links?.instagram ?? "",
      tiktok: draft?.social_links?.tiktok ?? "",
      youtube: draft?.social_links?.youtube ?? "",
    }),
    [draft],
  );

  if (!draft) return null;

  const setSocial = (key: string, val: string) => {
    setDraft({
      ...draft,
      social_links: { ...(draft.social_links ?? {}), [key]: val.trim() || null },
    });
  };

  const applyLinkedUser = (p: ProfileHit) => {
    setDraft({
      ...draft,
      linked_user_id: p.id,
      name: p.display_name || p.username || draft.name,
      photo_url: p.avatar_url ?? draft.photo_url ?? "",
      linked_profile: p,
    });
  };
  const clearLinkedUser = () => setDraft({ ...draft, linked_user_id: null, linked_profile: null });

  const canSave = draft.name.trim().length > 0 && !m.isPending;

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit nominee" : "Add nominee"}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "user" | "external")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Existing user</TabsTrigger>
            <TabsTrigger value="external">External</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="mt-4 space-y-3">
            {draft.linked_user_id ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={draft.linked_profile?.avatar_url ?? draft.photo_url ?? undefined} />
                  <AvatarFallback style={{ background: draft.linked_profile?.avatar_color ?? undefined }}>
                    {(draft.name || "?").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-sm font-semibold">
                    {draft.linked_profile?.display_name ?? draft.name}
                    {draft.linked_profile?.verified ? <BadgeCheck className="h-3.5 w-3.5 text-sky-400" /> : null}
                  </div>
                  {draft.linked_profile?.username && (
                    <div className="truncate text-xs text-muted-foreground">@{draft.linked_profile.username}</div>
                  )}
                </div>
                <Button size="icon" variant="ghost" onClick={clearLinkedUser} aria-label="Unlink"><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Search members</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by name or @username"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-background/50">
                  {debounced.trim().length < 2 ? (
                    <p className="p-3 text-xs text-muted-foreground">Type at least 2 characters…</p>
                  ) : isFetching ? (
                    <p className="p-3 text-xs text-muted-foreground">Searching…</p>
                  ) : hits.length === 0 ? (
                    <p className="p-3 text-xs text-muted-foreground">No members found.</p>
                  ) : (
                    hits.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyLinkedUser(p)}
                        className="flex w-full items-center gap-3 border-b border-white/5 p-2 text-left transition hover:bg-white/5 last:border-0"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={p.avatar_url ?? undefined} />
                          <AvatarFallback style={{ background: p.avatar_color ?? undefined }}>
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 truncate text-sm font-medium">
                            {p.display_name ?? p.username ?? "Member"}
                            {p.verified && <BadgeCheck className="h-3.5 w-3.5 text-sky-400" />}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">@{p.username ?? "user"}</div>
                        </div>
                        <Check className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div>
              <Label>Competition bio (optional)</Label>
              <Textarea
                rows={3}
                placeholder="Why they're competing…"
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="external" className="mt-4 space-y-3">
            <div>
              <Label>Display name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label>Photo URL</Label>
              <Input value={draft.photo_url ?? ""} onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })} />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea rows={3} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Country (ISO)</Label>
                <Input
                  placeholder="e.g. IN, US, PK"
                  maxLength={3}
                  value={draft.country ?? ""}
                  onChange={(e) => setDraft({ ...draft, country: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input placeholder="https://…" value={draft.website ?? ""} onChange={(e) => setDraft({ ...draft, website: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Twitter/X URL</Label>
                <Input value={socials.twitter ?? ""} onChange={(e) => setSocial("twitter", e.target.value)} />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={socials.instagram ?? ""} onChange={(e) => setSocial("instagram", e.target.value)} />
              </div>
              <div>
                <Label>TikTok URL</Label>
                <Input value={socials.tiktok ?? ""} onChange={(e) => setSocial("tiktok", e.target.value)} />
              </div>
              <div>
                <Label>YouTube URL</Label>
                <Input value={socials.youtube ?? ""} onChange={(e) => setSocial("youtube", e.target.value)} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Featured</span>
            <Switch
              checked={!!draft.is_featured}
              onCheckedChange={(v) => setDraft({ ...draft, is_featured: v })}
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Pinned</span>
            <Switch
              checked={!!draft.is_pinned}
              onCheckedChange={(v) => setDraft({ ...draft, is_pinned: v })}
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onChange(null)}>Cancel</Button>
          <Button
            disabled={!canSave}
            onClick={() => {
              const payload: CompetitorDraft = {
                ...draft,
                name: draft.name.trim(),
                // Ensure a display name when linking to an existing user without editing.
                photo_url: draft.photo_url?.trim() || null,
                description: draft.description?.trim() || null,
              };
              // Strip helper-only field before sending.
              const { linked_profile: _lp, ...rest } = payload;
              m.mutate(rest);
            }}
          >
            {m.isPending ? "Saving…" : "Save nominee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
