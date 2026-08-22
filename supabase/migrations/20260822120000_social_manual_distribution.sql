-- Manual social distribution inbox for existing Yaarzo welcome feed posts.
-- Does NOT create a second welcome caption or a second feed post.
-- Instagram / X / TikTok remain on the existing Buffer auto-queue.

CREATE TABLE IF NOT EXISTS public.social_manual_distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'not_posted'
    CHECK (status = ANY (ARRAY[
      'not_posted'::text,
      'posted'::text,
      'skipped'::text
    ])),
  published_url text,
  posted_at timestamptz,
  posted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_manual_distribution_platform_check CHECK (
    platform = ANY (ARRAY[
      'facebook'::text,
      'pinterest'::text,
      'bluesky'::text,
      'youtube'::text
    ])
  ),
  CONSTRAINT social_manual_distribution_post_platform_unique UNIQUE (feed_post_id, platform)
);

CREATE INDEX IF NOT EXISTS social_manual_distribution_post_idx
  ON public.social_manual_distribution (feed_post_id);
CREATE INDEX IF NOT EXISTS social_manual_distribution_user_idx
  ON public.social_manual_distribution (user_id);
CREATE INDEX IF NOT EXISTS social_manual_distribution_status_idx
  ON public.social_manual_distribution (status);

COMMENT ON TABLE public.social_manual_distribution IS
  'Lightweight per-platform status for manual sharing of an existing welcome feed post. Canonical content lives on posts (feed_post_id).';

ALTER TABLE public.social_manual_distribution ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_manual_distribution admin all" ON public.social_manual_distribution;
CREATE POLICY "social_manual_distribution admin all"
  ON public.social_manual_distribution
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_manual_distribution TO authenticated;
GRANT ALL ON public.social_manual_distribution TO service_role;

-- Tag existing welcome feed posts so they can be resolved as the canonical source.
UPDATE public.posts
SET category = 'new_member'
WHERE category IS NULL
  AND slug LIKE 'welcome-%';

-- Seed distribution rows for eligible existing welcome posts (consent required).
INSERT INTO public.social_manual_distribution (feed_post_id, user_id, platform)
SELECT p.id, p.owner_id, plat.platform
FROM public.posts p
JOIN public.profiles pr ON pr.id = p.owner_id
CROSS JOIN (
  SELECT unnest(ARRAY['facebook','pinterest','bluesky','youtube']) AS platform
) plat
WHERE pr.allow_social_feature = true
  AND (
    p.category = 'new_member'
    OR p.slug LIKE 'welcome-%'
  )
ON CONFLICT (feed_post_id, platform) DO NOTHING;

-- Auto-add future welcome feed posts to the manual inbox when the member consented.
CREATE OR REPLACE FUNCTION public.social_manual_seed_for_welcome_post(_post_id uuid, _user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _allowed boolean;
BEGIN
  SELECT allow_social_feature INTO _allowed
  FROM public.profiles
  WHERE id = _user_id;

  IF _allowed IS NOT TRUE THEN
    RETURN;
  END IF;

  INSERT INTO public.social_manual_distribution (feed_post_id, user_id, platform, status)
  SELECT _post_id, _user_id, plat, 'not_posted'
  FROM unnest(ARRAY['facebook','pinterest','bluesky','youtube']) AS plat
  ON CONFLICT (feed_post_id, platform) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'social_manual_seed_for_welcome_post failed for %: %', _post_id, SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_social_manual_on_welcome_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.category = 'new_member'
     OR NEW.slug LIKE 'welcome-%' THEN
    PERFORM public.social_manual_seed_for_welcome_post(NEW.id, NEW.owner_id);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'trg_social_manual_on_welcome_post failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_manual_on_welcome_post ON public.posts;
CREATE TRIGGER trg_social_manual_on_welcome_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_social_manual_on_welcome_post();
