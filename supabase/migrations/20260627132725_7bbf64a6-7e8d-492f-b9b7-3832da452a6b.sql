UPDATE public.app_settings
SET value = jsonb_set(jsonb_set(value, '{signupEnabled}', 'true'::jsonb), '{guestEnabled}', 'true'::jsonb),
    updated_at = now()
WHERE key = 'signup_access';