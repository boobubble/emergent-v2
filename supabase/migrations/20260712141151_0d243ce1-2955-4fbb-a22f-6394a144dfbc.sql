INSERT INTO public.chat_themes
  (theme_key, name, description, price_coins, unlock_mode, is_default, sort_order, accent_hex)
VALUES
  ('gaming_arena', 'Gaming Arena', 'Premium eSports lobby vibe — neon glow, animated arena background, gamified message cards.', 2500, 'lifetime', false, 35, '#a855f7')
ON CONFLICT (theme_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  accent_hex = EXCLUDED.accent_hex,
  sort_order = EXCLUDED.sort_order;