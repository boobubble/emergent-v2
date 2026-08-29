/** Admin blog delete helpers. DB delete is authorized by existing blog_posts RLS. */

export function isValidBlogDeleteId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

export function removeBlogFromList<T extends { id: string }>(posts: T[], id: string): T[] {
  if (!isValidBlogDeleteId(id)) return posts;
  return posts.filter((post) => post.id !== id);
}

export function nextPageAfterDelete(page: number, remainingCount: number, pageSize: number): number {
  const totalPages = Math.max(1, Math.ceil(Math.max(0, remainingCount) / pageSize) || 1);
  return Math.min(Math.max(1, page), totalPages);
}

export function canStartBlogDelete(inFlight: boolean): boolean {
  return !inFlight;
}

/**
 * Storage objects live in feed-media/{uid}/blog/... and public URLs can be copied
 * into Custom Pages, Feed, or another blog. Exclusive ownership cannot be proven
 * from this module alone, so cleanup never removes storage objects.
 */
export function planBlogImageCleanup(_html: string | null | undefined): {
  deleteStorage: false;
  reason: string;
} {
  return {
    deleteStorage: false,
    reason:
      "Cannot prove exclusive ownership across Blog, Custom Pages, Feed, and other modules.",
  };
}
