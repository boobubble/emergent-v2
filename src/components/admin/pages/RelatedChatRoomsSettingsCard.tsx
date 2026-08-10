/**
 * Settings-tab editor for Related Chat Rooms presentation config.
 * Saves via the page Update button (custom_pages.related_chat_rooms).
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Link2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listRelatedChatRoomTargets } from "@/lib/pages.functions";
import {
  RELATED_CHAT_ROOMS_HEADING,
  RELATED_CHAT_ROOMS_MAX,
  selectRelatedChatRooms,
  type RelatedRoomTargetPage,
} from "@/lib/pages-cms/related-chat-rooms";
import {
  defaultRelatedChatRoomsConfig,
  newRelatedChatRoomItemId,
  type RelatedChatRoomItem,
  type RelatedChatRoomsConfig,
} from "@/lib/pages-cms/related-chat-rooms-config";
import { pagePublicPath } from "@/lib/page-slug";

export type RelatedTargetOption = {
  id: string;
  slug: string;
  title: string;
  h1?: string | null;
  page_type?: string | null;
  country_id?: string | null;
  href: string;
};

type Props = {
  pageId: string | null;
  pageSlug: string;
  pageType: string | null;
  countryId: string | null;
  value: RelatedChatRoomsConfig;
  onChange: (next: RelatedChatRoomsConfig) => void;
};

function SortableRelatedRow({
  item,
  targets,
  usedTargetIds,
  onChange,
  onRemove,
}: {
  item: RelatedChatRoomItem;
  targets: RelatedTargetOption[];
  usedTargetIds: Set<string>;
  onChange: (next: RelatedChatRoomItem) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };
  const selected = targets.find((t) => t.id === item.target_page_id);
  const href = selected ? pagePublicPath(selected.slug) : "";
  const options = targets.filter(
    (t) => t.id === item.target_page_id || !usedTargetIds.has(t.id),
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border/80 bg-background p-3 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-6 inline-flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md border border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <Label className="text-[11px] text-muted-foreground">Button label</Label>
            <Input
              className="mt-1 h-8"
              value={item.label ?? ""}
              maxLength={120}
              placeholder={selected?.title || "Fallback to target page title"}
              onChange={(e) =>
                onChange({ ...item, label: e.target.value.trim() ? e.target.value : null })
              }
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Target page</Label>
            <Select
              value={item.target_page_id || undefined}
              onValueChange={(id) => onChange({ ...item, target_page_id: id })}
            >
              <SelectTrigger className="mt-1 h-8">
                <SelectValue placeholder="Select published page…" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {options.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title} <span className="text-muted-foreground">(/{t.slug})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[11px] text-muted-foreground">
              URL preview: {href || "—"}
            </p>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
                Enabled
                <AdminToggle
                  size="sm"
                  checked={item.enabled !== false}
                  onCheckedChange={(v) => onChange({ ...item, enabled: v })}
                  ariaLabel="Enable related button"
                />
              </label>
              <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-destructive" onClick={onRemove}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RelatedChatRoomsSettingsCard({
  pageId,
  pageSlug,
  pageType,
  countryId,
  value,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");
  const fetchTargets = useServerFn(listRelatedChatRoomTargets);
  const targetsQ = useQuery({
    queryKey: ["admin", "related-chat-room-targets", pageId, search],
    queryFn: () =>
      fetchTargets({
        data: {
          excludePageId: pageId || undefined,
          q: search.trim() || undefined,
          limit: 150,
        },
      }),
    enabled: true,
    staleTime: 30_000,
  });

  const targets = (targetsQ.data ?? []) as RelatedTargetOption[];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const usedTargetIds = useMemo(
    () => new Set(value.items.map((i) => i.target_page_id).filter(Boolean)),
    [value.items],
  );

  const previewLinks = useMemo(() => {
    const byId = new Map<string, RelatedRoomTargetPage>();
    for (const t of targets) {
      byId.set(t.id, {
        id: t.id,
        slug: t.slug,
        title: t.title,
        h1: t.h1 ?? null,
        status: "published",
        noindex: false,
        page_type: t.page_type,
        country_id: t.country_id,
      });
    }
    // Ensure currently selected targets are present even if filtered out of search.
    for (const item of value.items) {
      if (byId.has(item.target_page_id)) continue;
      const hit = targets.find((t) => t.id === item.target_page_id);
      if (hit) {
        byId.set(hit.id, {
          id: hit.id,
          slug: hit.slug,
          title: hit.title,
          h1: hit.h1 ?? null,
          status: "published",
          noindex: false,
          page_type: hit.page_type,
          country_id: hit.country_id,
        });
      }
    }
    return selectRelatedChatRooms({
      source: {
        id: pageId || "00000000-0000-4000-8000-000000000000",
        slug: pageSlug || "page",
        page_type: pageType,
        country_id: countryId,
      },
      links: [],
      targetsById: byId,
      targetsBySlug: new Map([...byId.values()].map((t) => [t.slug.toLowerCase(), t])),
      fillCandidates: value.auto_fill ? [...byId.values()] : [],
      config: value,
    });
  }, [targets, value, pageId, pageSlug, pageType, countryId]);

  function updateItems(items: RelatedChatRoomItem[]) {
    onChange({
      ...value,
      items: items.map((item, idx) => ({ ...item, sort_order: idx })),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.items.findIndex((i) => i.id === active.id);
    const newIndex = value.items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    updateItems(arrayMove(value.items, oldIndex, newIndex));
  }

  function addItem() {
    if (value.items.length >= RELATED_CHAT_ROOMS_MAX) return;
    const nextAvailable = targets.find((t) => !usedTargetIds.has(t.id));
    if (!nextAvailable) return;
    updateItems([
      ...value.items,
      {
        id: newRelatedChatRoomItemId(),
        target_page_id: nextAvailable.id,
        label: null,
        enabled: true,
        sort_order: value.items.length,
      },
    ]);
  }

  const atMax = value.items.length >= RELATED_CHAT_ROOMS_MAX;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">Auto-fill remaining slots</p>
          <p className="text-[11px] text-muted-foreground">
            Manual buttons first, then page_internal_links, then same-country/category fill (max {RELATED_CHAT_ROOMS_MAX}).
          </p>
        </div>
        <AdminToggle
          checked={value.auto_fill !== false}
          onCheckedChange={(v) => onChange({ ...value, auto_fill: v })}
          ariaLabel="Auto-fill remaining related chat rooms"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] text-muted-foreground">Search published targets</Label>
        <Input
          className="h-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title or slug…"
        />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {value.items.length === 0 ? (
              <p className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-[12px] text-muted-foreground">
                No manual buttons yet. {value.auto_fill !== false
                  ? "Auto-fill will generate related rooms from internal links and same-country pages."
                  : "Auto-fill is off — the public section will stay empty until you add buttons."}
              </p>
            ) : (
              value.items.map((item) => (
                <SortableRelatedRow
                  key={item.id}
                  item={item}
                  targets={targets}
                  usedTargetIds={usedTargetIds}
                  onChange={(next) =>
                    updateItems(value.items.map((row) => (row.id === item.id ? next : row)))
                  }
                  onRemove={() => updateItems(value.items.filter((row) => row.id !== item.id))}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={atMax || !targets.some((t) => !usedTargetIds.has(t.id))}
        onClick={addItem}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add Related Chat Room
        <span className="ml-2 text-[10px] text-muted-foreground">
          {value.items.length}/{RELATED_CHAT_ROOMS_MAX}
        </span>
      </Button>

      <div className="rounded-lg border border-border/70 bg-muted/15 p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Link2 className="h-3.5 w-3.5" />
          Public preview
        </div>
        {previewLinks.length ? (
          <div>
            <p className="text-sm font-semibold tracking-tight">{RELATED_CHAT_ROOMS_HEADING}</p>
            <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
              {previewLinks.map((link) => (
                <li key={link.slug}>
                  <span className="inline-flex items-center rounded-md border border-border/80 bg-background px-3 py-1.5 text-xs font-medium">
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">No eligible related rooms to preview.</p>
        )}
      </div>
    </div>
  );
}

export { defaultRelatedChatRoomsConfig };
