// Reusable skeleton placeholders for the feed surface.
// Keep these purely presentational — no data fetching.

export function PostSkeleton() {
  return (
    <div className="feed-card p-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded skeleton-shimmer" />
          <div className="h-2.5 w-1/4 rounded skeleton-shimmer" />
        </div>
        <div className="h-7 w-7 rounded-full skeleton-shimmer" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded skeleton-shimmer" />
        <div className="h-3 w-11/12 rounded skeleton-shimmer" />
        <div className="h-3 w-4/5 rounded skeleton-shimmer" />
      </div>
      <div className="mt-4 h-44 w-full rounded-xl skeleton-shimmer" />
      <div className="mt-4 flex items-center gap-2">
        <div className="h-7 w-20 rounded-full skeleton-shimmer" />
        <div className="h-7 w-20 rounded-full skeleton-shimmer" />
        <div className="h-7 w-16 rounded-full skeleton-shimmer" />
        <div className="ml-auto h-7 w-7 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="shrink-0 snap-start w-[112px] h-[176px] rounded-[1.25rem] overflow-hidden bg-card border border-border relative">
      <div className="absolute inset-0 skeleton-shimmer opacity-60" />
      <div className="absolute top-2 left-2 h-8 w-8 rounded-full skeleton-shimmer ring-2 ring-card" />
      <div className="absolute inset-x-2 bottom-2 h-3 rounded skeleton-shimmer" />
    </div>
  );
}

export function StoryTraySkeleton() {
  return (
    <div className="feed-card p-3 sm:p-4">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function WidgetSkeleton({ rows = 3, title = true }: { rows?: number; title?: boolean }) {
  return (
    <div className="feed-card p-4">
      {title && (
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
          <div className="h-3 w-24 rounded skeleton-shimmer" />
        </div>
      )}
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full skeleton-shimmer" />
            <div className="h-3 flex-1 rounded skeleton-shimmer" />
            <div className="h-3 w-8 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RewardsWidgetSkeleton() {
  return (
    <div className="feed-card p-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded skeleton-shimmer" />
        <div className="h-4 w-14 rounded-full skeleton-shimmer" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-2.5 w-10 rounded skeleton-shimmer" />
          <div className="h-5 w-8 rounded skeleton-shimmer" />
        </div>
        <div className="space-y-1.5 items-end flex flex-col">
          <div className="h-3 w-14 rounded skeleton-shimmer" />
          <div className="h-2.5 w-10 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full skeleton-shimmer" />
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="h-12 rounded-xl skeleton-shimmer" />
        <div className="h-12 rounded-xl skeleton-shimmer" />
        <div className="h-12 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}
