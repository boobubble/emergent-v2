
-- Extend app_role enum with broadcaster roles (idempotent)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dj';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rj';
