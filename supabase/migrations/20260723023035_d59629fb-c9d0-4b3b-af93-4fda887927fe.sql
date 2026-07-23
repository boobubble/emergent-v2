
-- 1. Add feed_moderator role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'feed_moderator';
