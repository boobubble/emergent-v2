import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Trash2, EyeOff, Eye, Ban, Undo2, GripVertical, Pin, Sparkles } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminDeleteCompetitor,
  adminReorderCompetitors,
  adminSetCompetitorFlags,
  adminSaveCompetitor,
} from "@/lib/competitions.functions";
import type { Competitor } from "./CompetitorGrid";

interface Props {
  competitionId: string;
  competitors: Competitor[];
  onEdit: (c: Competitor) => void;
  invalidateKey: (string | number)[];
}

export function AdminCompetitorSortableGrid({ competitionId: _competitionId, competitors, onEdit, invalidateKey }: Props) {
  const [items, setItems] = useState<Competitor[]>(competitors);
  useEffect(() => setItems(competitors), [competitors]);

  const reorder = useServerFn(adminReorderCompetitors);
  const del = useServerFn(adminDeleteCompetitor);
  const setFlags = useServerFn(adminSetCompetitorFlags);
  const save = useServerFn(adminSaveCompetitor);
  const qc = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  const reorderM = useMutation({
    mutationFn: (orders: Array<{ id: string; sort_order: number }>) => reorder({ data: { orders } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Reorder failed"),
  });

  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: invalidateKey }); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const flagsM = useMutation({
    mutationFn: (v: { id: string; is_hidden?: boolean; is_disqualified?: boolean }) => setFlags({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const toggleM = useMutation({
    mutationFn: (v: { c: Competitor; field: "is_featured" | "is_pinned" }) =>
      save({
        data: {
          id: v.c.id,
          competition_id: v.c.competition_id,
          name: v.c.name,
          photo_url: v.c.photo_url ?? null,
          description: v.c.description ?? null,
          linked_user_id: v.c.linked_user_id ?? null,
          country: v.c.country ?? null,
          website: v.c.website ?? null,
          social_links: v.c.social_links ?? {},
          is_featured: v.field === "is_featured" ? !v.c.is_featured : v.c.is_featured,
          is_pinned: v.field === "is_pinned" ? !v.c.is_pinned : v.c.is_pinned,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorderM.mutate(next.map((c, idx) => ({ id: c.id, sort_order: idx })));
  };

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No nominees yet. Add the first one above.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((c) => (
            <SortableRow
              key={c.id}
              c={c}
              onEdit={() => onEdit(c)}
              onDelete={() => confirm(`Remove ${c.name}?`) && delM.mutate(c.id)}
              onToggleHidden={() => flagsM.mutate({ id: c.id, is_hidden: !c.is_hidden })}
              onToggleDisqualified={() => flagsM.mutate({ id: c.id, is_disqualified: !c.is_disqualified })}
              onToggleFeatured={() => toggleM.mutate({ c, field: "is_featured" })}
              onTogglePinned={() => toggleM.mutate({ c, field: "is_pinned" })}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  c, onEdit, onDelete, onToggleHidden, onToggleDisqualified, onToggleFeatured, onTogglePinned,
}: {
  c: Competitor;
  onEdit: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
  onToggleDisqualified: () => void;
  onToggleFeatured: () => void;
  onTogglePinned: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-white/10 bg-background/60 p-2 pr-3 backdrop-blur ${
        c.is_hidden ? "opacity-60" : ""
      } ${c.is_disqualified ? "border-rose-500/30" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="grid h-9 w-6 shrink-0 cursor-grab place-items-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={c.photo_url ?? c.linked_profile?.avatar_url ?? undefined} />
        <AvatarFallback style={{ background: c.linked_profile?.avatar_color ?? undefined }}>
          {c.name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-medium">{c.name}</span>
          {c.linked_profile?.username && (
            <span className="truncate text-xs text-muted-foreground">@{c.linked_profile.username}</span>
          )}
          {c.is_featured && <Badge className="border border-amber-500/40 bg-amber-500/15 text-[10px] text-amber-300">Featured</Badge>}
          {c.is_pinned && <Badge className="border border-sky-500/40 bg-sky-500/15 text-[10px] text-sky-300">Pinned</Badge>}
          {c.is_hidden && <Badge variant="outline" className="text-[10px]">Hidden</Badge>}
          {c.is_disqualified && <Badge variant="destructive" className="text-[10px]">Disqualified</Badge>}
        </div>
        <div className="text-xs text-muted-foreground">{c.vote_count} votes</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleFeatured}
          aria-label={c.is_featured ? "Unfeature" : "Feature"}
          title={c.is_featured ? "Unfeature" : "Feature"}
        >
          <Sparkles className={`h-4 w-4 ${c.is_featured ? "text-amber-400" : ""}`} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onTogglePinned}
          aria-label={c.is_pinned ? "Unpin" : "Pin"}
          title={c.is_pinned ? "Unpin" : "Pin"}
        >
          <Pin className={`h-4 w-4 ${c.is_pinned ? "text-sky-400" : ""}`} />
        </Button>
        <Button size="icon" variant="ghost" onClick={onToggleHidden} aria-label={c.is_hidden ? "Show" : "Hide"} title={c.is_hidden ? "Show" : "Hide"}>
          {c.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleDisqualified}
          aria-label={c.is_disqualified ? "Restore" : "Disqualify"}
          title={c.is_disqualified ? "Restore" : "Disqualify"}
        >
          {c.is_disqualified ? <Undo2 className="h-4 w-4" /> : <Ban className="h-4 w-4 text-rose-400" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Edit" title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete" title="Delete">
          <Trash2 className="h-4 w-4 text-rose-400" />
        </Button>
      </div>
    </li>
  );
}
