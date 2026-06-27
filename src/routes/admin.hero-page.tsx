import { createFileRoute } from "@tanstack/react-router";
import { Save, Sparkles, Image as ImageIcon, Plus, Trash2, GripVertical, Eye, EyeOff, RotateCcw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useAdminSetting } from "@/lib/use-admin-setting";
import {
  HERO_DEFAULTS, HERO_SETTINGS_KEY, HERO_SECTION_LABELS, HOME_PAGE_KEY,
  type HeroConfig, type HeroSection, type HeroShowcaseItem,
  type HomePageMode, type FamousChatroom, type LiveUserCard, type DailyMissionCard,
} from "@/lib/hero-page-config";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/admin/hero-page")({
  component: HeroPageAdmin,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ShowcaseEditor({
  title, items, onChange,
}: {
  title: string;
  items: HeroShowcaseItem[];
  onChange: (next: HeroShowcaseItem[]) => void;
}) {
  const update = (i: number, key: keyof HeroShowcaseItem, value: string) => {
    const next = [...items]; next[i] = { ...next[i], [key]: value }; onChange(next);
  };
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{title}</div>
          <Button size="sm" variant="outline" onClick={() => onChange([...items, { emoji: "✨", title: "New", description: "Describe it." }])}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[60px_1fr_2fr_auto]">
              <Input value={it.emoji} onChange={(e) => update(i, "emoji", e.target.value)} className="text-center" />
              <Input value={it.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Title" />
              <Input value={it.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description" />
              <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FamousChatroomsEditor({ items, onChange }: { items: FamousChatroom[]; onChange: (next: FamousChatroom[]) => void }) {
  const update = (i: number, key: keyof FamousChatroom, value: string | number) => {
    const next = [...items]; next[i] = { ...next[i], [key]: value } as FamousChatroom; onChange(next);
  };
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Famous chatrooms 🔥</div>
          <Button size="sm" variant="outline" onClick={() => onChange([...items, { emoji: "💬", name: "New Room", topic: "Topic…", members: 50 }])}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[50px_1fr_2fr_90px_auto]">
              <Input value={it.emoji} onChange={(e) => update(i, "emoji", e.target.value)} className="text-center" />
              <Input value={it.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Room name" />
              <Input value={it.topic} onChange={(e) => update(i, "topic", e.target.value)} placeholder="Topic" />
              <Input type="number" min={0} value={it.members} onChange={(e) => update(i, "members", Number(e.target.value) || 0)} placeholder="Members" />
              <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LiveUsersEditor({ items, onChange }: { items: LiveUserCard[]; onChange: (next: LiveUserCard[]) => void }) {
  const update = (i: number, key: keyof LiveUserCard, value: string) => {
    const next = [...items]; next[i] = { ...next[i], [key]: value } as LiveUserCard; onChange(next);
  };
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Live users 🟢</div>
          <Button size="sm" variant="outline" onClick={() => onChange([...items, { emoji: "✨", name: "New User", status: "Just joined" }])}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[50px_1fr_2fr_2fr_auto]">
              <Input value={it.emoji} onChange={(e) => update(i, "emoji", e.target.value)} className="text-center" />
              <Input value={it.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Name" />
              <Input value={it.status} onChange={(e) => update(i, "status", e.target.value)} placeholder="Status" />
              <Input value={it.imageUrl ?? ""} onChange={(e) => update(i, "imageUrl", e.target.value)} placeholder="Image URL (optional)" />
              <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DailyMissionsEditor({ items, onChange }: { items: DailyMissionCard[]; onChange: (next: DailyMissionCard[]) => void }) {
  const update = (i: number, key: keyof DailyMissionCard, value: string) => {
    const next = [...items]; next[i] = { ...next[i], [key]: value } as DailyMissionCard; onChange(next);
  };
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Daily missions 🎯</div>
          <Button size="sm" variant="outline" onClick={() => onChange([...items, { emoji: "🎯", title: "New mission", reward: "+25 XP", description: "Describe the goal." }])}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[50px_1fr_120px_2fr_auto]">
              <Input value={it.emoji} onChange={(e) => update(i, "emoji", e.target.value)} className="text-center" />
              <Input value={it.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Mission title" />
              <Input value={it.reward} onChange={(e) => update(i, "reward", e.target.value)} placeholder="Reward" />
              <Input value={it.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description" />
              <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SortableSectionRow({
  section, onToggle,
}: { section: HeroSection; onToggle: (enabled: boolean) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const meta = HERO_SECTION_LABELS[section.key];
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border bg-card p-3 transition-shadow ${isDragging ? "shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded-md p-2 text-muted-foreground hover:bg-accent active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-lg">{meta.emoji}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {meta.label}
          {!section.enabled && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Hidden</span>}
        </div>
        <div className="truncate text-xs text-muted-foreground">{meta.description}</div>
      </div>
      <div className="flex items-center gap-2">
        {section.enabled ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
        <Switch checked={section.enabled} onCheckedChange={onToggle} aria-label="Toggle section" />
      </div>
    </div>
  );
}

function SectionsArranger({
  sections, onChange,
}: { sections: HeroSection[]; onChange: (next: HeroSection[]) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.key === active.id);
    const newIndex = sections.findIndex((s) => s.key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(sections, oldIndex, newIndex));
  };

  const reset = () => onChange(HERO_DEFAULTS.sections.map((s) => ({ ...s })));

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">Section arrangement</div>
            <div className="text-xs text-muted-foreground">
              Drag <GripVertical className="inline h-3 w-3" /> to reorder. Toggle to show or hide each section on the hero page.
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" /> Reset order
          </Button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <SortableSectionRow
                  key={s.key}
                  section={s}
                  onToggle={(enabled) => {
                    const next = [...sections];
                    next[i] = { ...next[i], enabled };
                    onChange(next);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}

function HomeSelector() {
  const { values, set, save, saving } = useAdminSetting<{ mode: HomePageMode }>(
    HOME_PAGE_KEY, { mode: "welcome" },
  );
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Active Landing Page</div>
            <div className="text-xs text-muted-foreground">
              Choose which page unauthenticated visitors see at <code>/</code>. Only one can be active at a time.
              Chatroom and Feed cannot be selected as homepage.
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
        <RadioGroup
          value={values.mode}
          onValueChange={(v) => set("mode", v as HomePageMode)}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${values.mode === "welcome" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="welcome" className="mt-1" />
            <div>
              <div className="text-sm font-semibold">Welcome Page</div>
              <div className="text-xs text-muted-foreground">Existing landing at <code>/welcome</code>.</div>
            </div>
          </label>
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${values.mode === "hero" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="hero" className="mt-1" />
            <div>
              <div className="text-sm font-semibold">Hero Homepage ✨</div>
              <div className="text-xs text-muted-foreground">Premium community landing at <code>/heropage</code>.</div>
            </div>
          </label>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export function HeroPageAdmin() {
  const { values, set, patch, save, saving } = useAdminSetting<HeroConfig>(
    HERO_SETTINGS_KEY, HERO_DEFAULTS,
  );

  // Ensure sections array always present (older saved configs may be missing it).
  const sections = values.sections && values.sections.length > 0 ? values.sections : HERO_DEFAULTS.sections;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Hero Homepage"
        description="Premium community landing page. Drag to rearrange sections, toggle visibility, edit content and images."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <HomeSelector />

      <SectionsArranger sections={sections} onChange={(next) => patch({ sections: next })} />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Hero content
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Brand name">
              <Input value={values.brandName} onChange={(e) => set("brandName", e.target.value)} />
            </Field>
            <Field label="Headline">
              <Input value={values.headline} onChange={(e) => set("headline", e.target.value)} />
            </Field>
          </div>
          <Field label="Subheadline">
            <Textarea rows={3} value={values.subheadline} onChange={(e) => set("subheadline", e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Join CTA"><Input value={values.ctaJoinLabel} onChange={(e) => set("ctaJoinLabel", e.target.value)} /></Field>
            <Field label="Login CTA"><Input value={values.ctaLoginLabel} onChange={(e) => set("ctaLoginLabel", e.target.value)} /></Field>
            <Field label="Guest CTA"><Input value={values.ctaGuestLabel} onChange={(e) => set("ctaGuestLabel", e.target.value)} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Final CTA title"><Input value={values.finalCtaTitle} onChange={(e) => set("finalCtaTitle", e.target.value)} /></Field>
            <Field label="Final CTA subtitle"><Input value={values.finalCtaSubtitle} onChange={(e) => set("finalCtaSubtitle", e.target.value)} /></Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="h-4 w-4 text-primary" /> Images
          </div>
          <Field label="Hero image (friends chatting)">
            <Input value={values.heroImageUrl} onChange={(e) => set("heroImageUrl", e.target.value)} />
          </Field>
          <Field label="Chatroom image">
            <Input value={values.chatroomImageUrl} onChange={(e) => set("chatroomImageUrl", e.target.value)} />
          </Field>
          <Field label="Feed image">
            <Input value={values.feedImageUrl} onChange={(e) => set("feedImageUrl", e.target.value)} />
          </Field>
          <Field label="Radio image">
            <Input value={values.radioImageUrl} onChange={(e) => set("radioImageUrl", e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <ShowcaseEditor title="Chatroom features 💬" items={values.chatroomFeatures} onChange={(v) => patch({ chatroomFeatures: v })} />
      <ShowcaseEditor title="Feed features 📰" items={values.feedFeatures} onChange={(v) => patch({ feedFeatures: v })} />
      <ShowcaseEditor title="Radio features 🎙️" items={values.radioFeatures} onChange={(v) => patch({ radioFeatures: v })} />
      <ShowcaseEditor title="Game features 🎮" items={values.gameFeatures} onChange={(v) => patch({ gameFeatures: v })} />
      <FamousChatroomsEditor items={values.famousChatrooms} onChange={(v) => patch({ famousChatrooms: v })} />
      <LiveUsersEditor items={values.liveUsers} onChange={(v) => patch({ liveUsers: v })} />
      <DailyMissionsEditor items={values.dailyMissions} onChange={(v) => patch({ dailyMissions: v })} />

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
