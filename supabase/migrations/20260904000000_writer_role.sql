-- Writer role: blog + custom-page content editing only.
-- Enum add must commit before policies can cast 'writer'::app_role.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'writer';
