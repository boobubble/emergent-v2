-- Canonicalize Internal Linking Hub targets: /p/{slug} → /{slug}
-- ( /p/:slug is a legacy redirect to /$slug ). Skip rows whose canonical
-- URL already exists so the unique(url) constraint is preserved.

UPDATE public.internal_link_targets
SET url = '/' || substring(url from 4),
    updated_at = now()
WHERE url LIKE '/p/%'
  AND url !~ '^/p/.+/.+'
  AND NOT EXISTS (
    SELECT 1
    FROM public.internal_link_targets other
    WHERE other.id <> internal_link_targets.id
      AND other.url = '/' || substring(internal_link_targets.url from 4)
  );

DELETE FROM public.internal_link_targets a
WHERE a.url LIKE '/p/%'
  AND EXISTS (
    SELECT 1
    FROM public.internal_link_targets b
    WHERE b.url = '/' || substring(a.url from 4)
  );
