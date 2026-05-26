UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL
  AND email IS NOT NULL
  AND COALESCE(is_anonymous, false) = false;