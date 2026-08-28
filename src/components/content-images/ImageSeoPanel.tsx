import { ImageStatusBadge } from "@/components/content-images/ImageStatusBadge";
import { Button } from "@/components/ui/button";
import {
  issueLabel,
  type ContentImageCheck,
  type ContentImageStatus,
} from "@/lib/content-image-seo";
import { cn } from "@/lib/utils";

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <p className={cn("text-[11px] leading-snug", ok ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-300")}>
      {ok ? "✓" : "⚠"} {label}
    </p>
  );
}

function ImageChecks({ image, index }: { image: ContentImageCheck; index: number }) {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-2.5">
      <p className="text-[11px] font-semibold text-foreground">Image {index + 1}</p>
      <CheckRow ok={image.uploaded} label={image.uploaded ? "Image uploaded" : "Image missing"} />
      <CheckRow
        ok={image.optimization === "ok"}
        label={
          image.optimization === "ok"
            ? "Optimized"
            : image.optimization === "unavailable"
              ? "Optimization unavailable"
              : "Optimization required"
        }
      />
      <CheckRow
        ok={image.altOk}
        label={image.decorative ? "Decorative (empty alt)" : image.altOk ? "Alt text" : "Alt text missing"}
      />
      {image.issues
        .filter((issue) => issue === "unsafe_src" || issue === "weak_alt")
        .map((issue) => (
          <p key={issue} className="text-[11px] text-amber-800 dark:text-amber-300">
            ⚠ {issueLabel(issue)}
          </p>
        ))}
    </div>
  );
}

export function ImageSeoPanel({
  status,
  highlight = false,
  onAddImage,
  onFixImage,
  onRemoveImage,
}: {
  status: ContentImageStatus;
  highlight?: boolean;
  onAddImage?: () => void;
  onFixImage?: (index: number) => void;
  onRemoveImage?: (index: number) => void;
}) {
  const firstProblem = status.images.findIndex((img) => !img.ready);
  return (
    <section
      id="image-seo-panel"
      className={cn(
        "rounded-xl border border-border bg-background p-4",
        highlight && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Image SEO</h2>
      <div className="mt-2">
        <ImageStatusBadge status={status} />
      </div>
      {status.kind === "missing" ? (
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          No image has been added yet. Image improvements can be completed later — publishing is not blocked.
        </p>
      ) : status.kind === "attention" ? (
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          {status.images.filter((img) => !img.ready).length} image{status.images.filter((img) => !img.ready).length === 1 ? "" : "s"} need attention.
          Image improvements can be completed later.
        </p>
      ) : (
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          Images look ready for accessibility and search.
        </p>
      )}

      {status.images.length > 0 && (
        <div className="mt-3 space-y-2">
          {status.images.map((image, index) => (
            <div key={`${image.src}-${index}`} className="space-y-1.5">
              <ImageChecks image={image} index={index} />
              <div className="flex flex-wrap gap-1.5">
                {onFixImage && !image.ready && (
                  <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onFixImage(index)}>
                    Fix Image
                  </Button>
                )}
                {onRemoveImage && (
                  <Button type="button" size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => onRemoveImage(index)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {onAddImage && (
          <Button type="button" size="sm" className="h-8" onClick={onAddImage}>
            {status.kind === "missing" ? "Add Image" : "Add another image"}
          </Button>
        )}
        {onFixImage && firstProblem >= 0 && status.kind !== "missing" && (
          <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => onFixImage(firstProblem)}>
            Fix Image
          </Button>
        )}
      </div>
    </section>
  );
}
