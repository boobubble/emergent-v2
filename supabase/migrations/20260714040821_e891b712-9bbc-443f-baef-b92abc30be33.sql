update public.app_settings
set value = jsonb_set(jsonb_set(value, '{guestEnabled}', 'true'::jsonb), '{signupEnabled}', 'true'::jsonb)
where key = 'signup_access';