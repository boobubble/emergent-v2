
-- =========================================================================
-- Creator Communities: foundation
-- =========================================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.community_privacy AS ENUM ('public','private','invite_only','password','invite_password');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.community_member_role AS ENUM ('owner','moderator','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.community_member_status AS ENUM ('active','pending','banned','muted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -------------------------------------------------------------------------
-- communities
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  welcome_text TEXT,
  logo_url TEXT,
  banner_url TEXT,
  background_url TEXT,
  accent_color TEXT DEFAULT '#7c3aed',
  rules TEXT,
  announcement TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  privacy_mode public.community_privacy NOT NULL DEFAULT 'public',
  join_password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  member_count INT NOT NULL DEFAULT 1,
  online_count INT NOT NULL DEFAULT 0,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS communities_owner_idx ON public.communities(owner_id);
CREATE INDEX IF NOT EXISTS communities_slug_idx ON public.communities(slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.communities TO authenticated;
GRANT SELECT ON public.communities TO anon;
GRANT ALL ON public.communities TO service_role;

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "communities read" ON public.communities;
CREATE POLICY "communities read" ON public.communities
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "communities owner update" ON public.communities;
CREATE POLICY "communities owner update" ON public.communities
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "communities admin delete" ON public.communities;
CREATE POLICY "communities admin delete" ON public.communities
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- Insert only via server (server_role); no INSERT policy for authenticated
-- (auto-provisioning uses supabaseAdmin).

-- -------------------------------------------------------------------------
-- community_members
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.community_member_role NOT NULL DEFAULT 'member',
  status public.community_member_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_members_user_idx ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS community_members_community_idx ON public.community_members(community_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO service_role;

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Security-definer helper to avoid recursion
CREATE OR REPLACE FUNCTION public.is_community_owner(_community UUID, _user UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.communities WHERE id = _community AND owner_id = _user);
$$;

CREATE OR REPLACE FUNCTION public.is_community_staff(_community UUID, _user UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.communities WHERE id = _community AND owner_id = _user
  ) OR EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = _community AND user_id = _user AND role IN ('owner','moderator') AND status = 'active'
  );
$$;

DROP POLICY IF EXISTS "cm read own or staff" ON public.community_members;
CREATE POLICY "cm read own or staff" ON public.community_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_community_staff(community_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.privacy_mode = 'public' AND status = 'active')
    OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
  );

DROP POLICY IF EXISTS "cm self insert" ON public.community_members;
CREATE POLICY "cm self insert" ON public.community_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cm staff update" ON public.community_members;
CREATE POLICY "cm staff update" ON public.community_members
  FOR UPDATE TO authenticated
  USING (public.is_community_staff(community_id, auth.uid()) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "cm staff delete" ON public.community_members;
CREATE POLICY "cm staff delete" ON public.community_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_community_staff(community_id, auth.uid()) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- -------------------------------------------------------------------------
-- community_invites
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_uses INT,
  uses INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_invites_community_idx ON public.community_invites(community_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_invites TO authenticated;
GRANT ALL ON public.community_invites TO service_role;

ALTER TABLE public.community_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invites staff manage" ON public.community_invites;
CREATE POLICY "invites staff manage" ON public.community_invites
  FOR ALL TO authenticated
  USING (public.is_community_staff(community_id, auth.uid()) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.is_community_staff(community_id, auth.uid()) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- Allow anon/authenticated to read a specific invite by code (for redemption UI).
DROP POLICY IF EXISTS "invites read by code" ON public.community_invites;
CREATE POLICY "invites read by code" ON public.community_invites
  FOR SELECT USING (true);

-- -------------------------------------------------------------------------
-- community_join_requests
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS cjr_community_idx ON public.community_join_requests(community_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_join_requests TO authenticated;
GRANT ALL ON public.community_join_requests TO service_role;

ALTER TABLE public.community_join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cjr read own or staff" ON public.community_join_requests;
CREATE POLICY "cjr read own or staff" ON public.community_join_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_community_staff(community_id, auth.uid())
    OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
  );

DROP POLICY IF EXISTS "cjr self insert" ON public.community_join_requests;
CREATE POLICY "cjr self insert" ON public.community_join_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cjr staff update" ON public.community_join_requests;
CREATE POLICY "cjr staff update" ON public.community_join_requests
  FOR UPDATE TO authenticated
  USING (public.is_community_staff(community_id, auth.uid()) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

DROP POLICY IF EXISTS "cjr self or staff delete" ON public.community_join_requests;
CREATE POLICY "cjr self or staff delete" ON public.community_join_requests
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_community_staff(community_id, auth.uid()) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- -------------------------------------------------------------------------
-- Extend existing modules with optional community_id (backward compatible)
-- -------------------------------------------------------------------------
ALTER TABLE public.posts        ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL;
ALTER TABLE public.chatrooms    ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS posts_community_idx        ON public.posts(community_id)        WHERE community_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS chatrooms_community_idx    ON public.chatrooms(community_id)    WHERE community_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS competitions_community_idx ON public.competitions(community_id) WHERE community_id IS NOT NULL;

-- -------------------------------------------------------------------------
-- updated_at triggers
-- -------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname='update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $f$
    BEGIN NEW.updated_at = now(); RETURN NEW; END; $f$ LANGUAGE plpgsql SET search_path=public;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_communities_updated_at ON public.communities;
CREATE TRIGGER trg_communities_updated_at BEFORE UPDATE ON public.communities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_community_members_updated_at ON public.community_members;
CREATE TRIGGER trg_community_members_updated_at BEFORE UPDATE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cjr_updated_at ON public.community_join_requests;
CREATE TRIGGER trg_cjr_updated_at BEFORE UPDATE ON public.community_join_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -------------------------------------------------------------------------
-- Slug helper + Auto-provision on Creator subscription
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_community_slug(_base TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s TEXT;
  candidate TEXT;
  i INT := 0;
  reserved TEXT[] := ARRAY['admin','api','feed','games','rooms','chatroom','chatrooms','messages','profile','settings','friends','find-friends','notifications','login','register','signup','logout','auth','account','achievements','leaderboard','reset-password','welcome','banned','confessions','feedback','u','p','assets','static','public','manifest','robots','sitemap','favicon','root','index','reels','pages','groups','installer','setup-wizard','pricing','wallet','deploy','radio','trust','heropage','community','communities','live-arena','broadcaster','gamification','competitions'];
BEGIN
  s := lower(regexp_replace(coalesce(_base,''), '[^a-z0-9]+', '-', 'gi'));
  s := regexp_replace(s, '^-+|-+$', '', 'g');
  IF s IS NULL OR length(s) < 2 THEN s := 'community'; END IF;
  IF length(s) > 40 THEN s := substr(s, 1, 40); END IF;

  candidate := s;
  WHILE (candidate = ANY(reserved))
     OR EXISTS(SELECT 1 FROM public.communities WHERE slug = candidate)
     OR EXISTS(SELECT 1 FROM public.custom_pages WHERE slug = candidate)
  LOOP
    i := i + 1;
    candidate := s || '-' || i::text;
    IF i > 500 THEN candidate := s || '-' || substr(md5(random()::text), 1, 6); EXIT; END IF;
  END LOOP;
  RETURN candidate;
END $$;

CREATE OR REPLACE FUNCTION public.provision_community_for_user(_user UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  existing UUID;
  new_id UUID;
  uname TEXT;
  new_slug TEXT;
BEGIN
  SELECT id INTO existing FROM public.communities WHERE owner_id = _user LIMIT 1;
  IF existing IS NOT NULL THEN RETURN existing; END IF;

  SELECT COALESCE(username, 'creator') INTO uname FROM public.profiles WHERE id = _user;
  new_slug := public.generate_community_slug(uname);

  INSERT INTO public.communities (owner_id, slug, name, description, privacy_mode)
  VALUES (_user, new_slug, COALESCE(uname,'Creator') || '''s Community', 'Welcome to my community!', 'public')
  RETURNING id INTO new_id;

  INSERT INTO public.community_members (community_id, user_id, role, status)
  VALUES (new_id, _user, 'owner', 'active')
  ON CONFLICT (community_id, user_id) DO NOTHING;

  RETURN new_id;
END $$;

-- Trigger on user_subscriptions: when active + Creator tier plan, provision.
CREATE OR REPLACE FUNCTION public.on_subscription_change_provision_community()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  plan_tier TEXT;
  plan_max INT;
BEGIN
  IF NEW.status NOT IN ('active','trialing') THEN RETURN NEW; END IF;
  SELECT tier, max_personal_chatrooms INTO plan_tier, plan_max
    FROM public.subscription_plans WHERE id = NEW.plan_id;
  -- Creator = any paid tier that grants personal rooms, OR tier explicitly labelled creator
  IF plan_tier ILIKE '%creator%' OR (plan_max IS NOT NULL AND plan_max > 0) THEN
    PERFORM public.provision_community_for_user(NEW.user_id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_provision_community ON public.user_subscriptions;
CREATE TRIGGER trg_provision_community
AFTER INSERT OR UPDATE OF status, plan_id ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.on_subscription_change_provision_community();

-- Back-fill for existing active creator subscriptions
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT us.user_id
      FROM public.user_subscriptions us
      JOIN public.subscription_plans p ON p.id = us.plan_id
     WHERE us.status IN ('active','trialing')
       AND (p.tier ILIKE '%creator%' OR COALESCE(p.max_personal_chatrooms,0) > 0)
  LOOP
    PERFORM public.provision_community_for_user(r.user_id);
  END LOOP;
END $$;
