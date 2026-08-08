-- =============================================================================
-- Phase 4A — Pages CMS taxonomy foundation (India + Pakistan)
-- =============================================================================
-- Idempotent / re-runnable where practical.
-- Does NOT insert or update custom_pages.
-- Does NOT generate SEO pages.
-- Lahore Chat Room custom_pages row remains untouched.
--
-- Phase 1 reuse contract:
--   * Preserve existing taxonomy row IDs (UPSERT / slug rename only).
--   * India Punjab: rename slug punjab-in → punjab (same ID).
--   * Categories girls-chat / dating-chat: reparent under chat-rooms (same IDs).
--   * Keyword group city-chat-room: update in place (same ID).
--   * Template default-city-chat-room: rename slug → city-chat-room (same ID),
--     then UPSERT content so there is exactly one City Chat Room template.
-- =============================================================================

-- Additive schema for keyword secondary patterns + template title/slug scaffolds
ALTER TABLE public.page_keyword_groups
  ADD COLUMN IF NOT EXISTS secondary_patterns TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.page_templates
  ADD COLUMN IF NOT EXISTS title_template TEXT,
  ADD COLUMN IF NOT EXISTS slug_template TEXT;

-- ---------------------------------------------------------------------------
-- PREFLIGHT: fail on ambiguous Phase 1 taxonomy before any writes
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  india_id UUID;
  v_count INTEGER;
  v_detail TEXT;
BEGIN
  SELECT id INTO india_id FROM public.page_countries WHERE slug = 'india';

  -- India must not already have BOTH punjab-in and punjab (would be two Punjabs)
  IF india_id IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM public.page_states
    WHERE country_id = india_id AND slug IN ('punjab', 'punjab-in');
    IF v_count > 1 THEN
      RAISE EXCEPTION
        'Phase 4A preflight failed: India has % Punjab slug variants (punjab / punjab-in). Resolve manually before apply.',
        v_count;
    END IF;

    -- Semantic duplicate states by normalized name within India
    SELECT string_agg(name || ' (' || cnt || ')', ', ') INTO v_detail
    FROM (
      SELECT lower(name) AS n, max(name) AS name, count(*) AS cnt
      FROM public.page_states
      WHERE country_id = india_id
      GROUP BY lower(name)
      HAVING count(*) > 1
    ) d;
    IF v_detail IS NOT NULL THEN
      RAISE EXCEPTION 'Phase 4A preflight failed: India duplicate state names: %', v_detail;
    END IF;
  END IF;

  -- Template collision: both default-city-chat-room and city-chat-room already exist
  SELECT count(*) INTO v_count
  FROM public.page_templates
  WHERE slug IN ('default-city-chat-room', 'city-chat-room');
  IF v_count > 1 THEN
    RAISE EXCEPTION
      'Phase 4A preflight failed: both default-city-chat-room and city-chat-room templates exist. Resolve before apply.';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- India Punjab: preserve existing ID, rename slug punjab-in → punjab
-- ---------------------------------------------------------------------------
-- Production Phase 1 row example:
--   id = acd5044a-8bb6-48b2-87b2-493853a6d311, slug = punjab-in
-- After this UPDATE the same ID becomes slug = punjab.
-- No DELETE/recreate. FK refs (page_cities.state_id / custom_pages.state_id) stay valid.
UPDATE public.page_states s
SET
  slug = 'punjab',
  name = 'Punjab',
  is_active = true,
  seo_enabled = true,
  updated_at = now()
FROM public.page_countries c
WHERE s.country_id = c.id
  AND c.slug = 'india'
  AND s.slug = 'punjab-in';

-- ---------------------------------------------------------------------------
-- City Chat Room template: preserve existing ID, rename default → city-chat-room
-- ---------------------------------------------------------------------------
-- Production Phase 1 row example:
--   id = e2d0ed75-5a4c-4c86-948b-beab44dddde5, slug = default-city-chat-room
-- After rename, UPSERT on city-chat-room updates the SAME row (one canonical template).
UPDATE public.page_templates
SET
  slug = 'city-chat-room',
  name = 'City Chat Room',
  updated_at = now()
WHERE slug = 'default-city-chat-room'
  AND NOT EXISTS (SELECT 1 FROM public.page_templates WHERE slug = 'city-chat-room');

-- Countries (already seeded; keep idempotent)
INSERT INTO public.page_countries (name, slug, iso_code, language, sort_order, is_active, seo_enabled)
VALUES
  ('India', 'india', 'IN', 'en', 1, true, true),
  ('Pakistan', 'pakistan', 'PK', 'en', 2, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  iso_code = EXCLUDED.iso_code,
  is_active = true,
  seo_enabled = true,
  updated_at = now();

-- Pakistan states / territories
INSERT INTO public.page_states (country_id, name, slug, sort_order, is_active, seo_enabled, language)
SELECT c.id, v.name, v.slug, v.sort_order, true, true, 'en'
FROM public.page_countries c
CROSS JOIN (VALUES
  ('Punjab', 'punjab', 1),
  ('Sindh', 'sindh', 2),
  ('Khyber Pakhtunkhwa', 'khyber-pakhtunkhwa', 3),
  ('Balochistan', 'balochistan', 4),
  ('Islamabad Capital Territory', 'islamabad-capital-territory', 5),
  ('Azad Kashmir', 'azad-kashmir', 6),
  ('Gilgit-Baltistan', 'gilgit-baltistan', 7)
) AS v(name, slug, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();

-- India states / UTs
-- After Punjab rename above, INSERT ... ON CONFLICT (country_id, slug) updates the
-- existing India Punjab row (same ID) instead of creating a second Punjab.
INSERT INTO public.page_states (country_id, name, slug, sort_order, is_active, seo_enabled, language)
SELECT c.id, v.name, v.slug, v.sort_order, true, true, 'en'
FROM public.page_countries c
CROSS JOIN (VALUES
  ('Andhra Pradesh', 'andhra-pradesh', 1),
  ('Arunachal Pradesh', 'arunachal-pradesh', 2),
  ('Assam', 'assam', 3),
  ('Bihar', 'bihar', 4),
  ('Chhattisgarh', 'chhattisgarh', 5),
  ('Goa', 'goa', 6),
  ('Gujarat', 'gujarat', 7),
  ('Haryana', 'haryana', 8),
  ('Himachal Pradesh', 'himachal-pradesh', 9),
  ('Jharkhand', 'jharkhand', 10),
  ('Karnataka', 'karnataka', 11),
  ('Kerala', 'kerala', 12),
  ('Madhya Pradesh', 'madhya-pradesh', 13),
  ('Maharashtra', 'maharashtra', 14),
  ('Manipur', 'manipur', 15),
  ('Meghalaya', 'meghalaya', 16),
  ('Mizoram', 'mizoram', 17),
  ('Nagaland', 'nagaland', 18),
  ('Odisha', 'odisha', 19),
  ('Punjab', 'punjab', 20),
  ('Rajasthan', 'rajasthan', 21),
  ('Sikkim', 'sikkim', 22),
  ('Tamil Nadu', 'tamil-nadu', 23),
  ('Telangana', 'telangana', 24),
  ('Tripura', 'tripura', 25),
  ('Uttar Pradesh', 'uttar-pradesh', 26),
  ('Uttarakhand', 'uttarakhand', 27),
  ('West Bengal', 'west-bengal', 28),
  ('Andaman and Nicobar Islands', 'andaman-and-nicobar-islands', 29),
  ('Chandigarh', 'chandigarh', 30),
  ('Dadra and Nagar Haveli and Daman and Diu', 'dadra-nagar-haveli-daman-diu', 31),
  ('Delhi', 'delhi', 32),
  ('Jammu and Kashmir', 'jammu-and-kashmir', 33),
  ('Ladakh', 'ladakh', 34),
  ('Lakshadweep', 'lakshadweep', 35),
  ('Puducherry', 'puducherry', 36)
) AS v(name, slug, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();

-- Cities (Pakistan) — ON CONFLICT (country_id, slug) reuses Phase 1 cities

INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'punjab'
CROSS JOIN (VALUES
  ('Lahore', 'lahore', ARRAY['Lahaur']::text[], 90, 1),
  ('Rawalpindi', 'rawalpindi', ARRAY['Pindi']::text[], 60, 2),
  ('Faisalabad', 'faisalabad', ARRAY['Lyallpur']::text[], 60, 3),
  ('Multan', 'multan', '{}'::text[], 60, 4),
  ('Gujranwala', 'gujranwala', '{}'::text[], 60, 5),
  ('Sialkot', 'sialkot', '{}'::text[], 60, 6),
  ('Bahawalpur', 'bahawalpur', '{}'::text[], 30, 7),
  ('Sargodha', 'sargodha', '{}'::text[], 30, 8),
  ('Sheikhupura', 'sheikhupura', '{}'::text[], 30, 9),
  ('Jhang', 'jhang', '{}'::text[], 30, 10),
  ('Gujrat', 'gujrat', '{}'::text[], 30, 11),
  ('Sahiwal', 'sahiwal', '{}'::text[], 30, 12),
  ('Okara', 'okara', '{}'::text[], 30, 13),
  ('Rahim Yar Khan', 'rahim-yar-khan', '{}'::text[], 30, 14),
  ('Dera Ghazi Khan', 'dera-ghazi-khan', ARRAY['DG Khan']::text[], 30, 15)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'sindh'
CROSS JOIN (VALUES
  ('Karachi', 'karachi', '{}'::text[], 90, 16),
  ('Hyderabad', 'hyderabad', '{}'::text[], 60, 17),
  ('Sukkur', 'sukkur', '{}'::text[], 30, 18),
  ('Larkana', 'larkana', '{}'::text[], 30, 19),
  ('Nawabshah', 'nawabshah', ARRAY['Shaheed Benazirabad']::text[], 30, 20)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'islamabad-capital-territory'
CROSS JOIN (VALUES
  ('Islamabad', 'islamabad', '{}'::text[], 90, 21)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'khyber-pakhtunkhwa'
CROSS JOIN (VALUES
  ('Peshawar', 'peshawar', '{}'::text[], 60, 22),
  ('Abbottabad', 'abbottabad', '{}'::text[], 30, 23),
  ('Mardan', 'mardan', '{}'::text[], 30, 24),
  ('Swat', 'swat', ARRAY['Mingora']::text[], 30, 25)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'balochistan'
CROSS JOIN (VALUES
  ('Quetta', 'quetta', '{}'::text[], 60, 26),
  ('Gwadar', 'gwadar', '{}'::text[], 30, 27),
  ('Turbat', 'turbat', '{}'::text[], 30, 28)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'azad-kashmir'
CROSS JOIN (VALUES
  ('Muzaffarabad', 'muzaffarabad', '{}'::text[], 30, 29),
  ('Mirpur', 'mirpur', '{}'::text[], 30, 30)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'gilgit-baltistan'
CROSS JOIN (VALUES
  ('Gilgit', 'gilgit', '{}'::text[], 30, 31),
  ('Skardu', 'skardu', '{}'::text[], 30, 32)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


-- Cities (India)

INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'delhi'
CROSS JOIN (VALUES
  ('Delhi', 'delhi', ARRAY['New Delhi', 'NCR']::text[], 90, 1)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'maharashtra'
CROSS JOIN (VALUES
  ('Mumbai', 'mumbai', ARRAY['Bombay']::text[], 90, 2),
  ('Pune', 'pune', '{}'::text[], 90, 3),
  ('Nagpur', 'nagpur', '{}'::text[], 60, 4),
  ('Nashik', 'nashik', '{}'::text[], 60, 5),
  ('Aurangabad', 'aurangabad', ARRAY['Chhatrapati Sambhajinagar']::text[], 60, 6)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'karnataka'
CROSS JOIN (VALUES
  ('Bengaluru', 'bengaluru', ARRAY['Bangalore']::text[], 90, 7),
  ('Mysuru', 'mysuru', ARRAY['Mysore']::text[], 30, 8),
  ('Mangaluru', 'mangaluru', ARRAY['Mangalore']::text[], 30, 9)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'telangana'
CROSS JOIN (VALUES
  ('Hyderabad', 'hyderabad', '{}'::text[], 90, 10)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'tamil-nadu'
CROSS JOIN (VALUES
  ('Chennai', 'chennai', ARRAY['Madras']::text[], 90, 11),
  ('Coimbatore', 'coimbatore', '{}'::text[], 60, 12),
  ('Madurai', 'madurai', '{}'::text[], 60, 13)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'west-bengal'
CROSS JOIN (VALUES
  ('Kolkata', 'kolkata', ARRAY['Calcutta']::text[], 90, 14),
  ('Howrah', 'howrah', '{}'::text[], 30, 15)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'gujarat'
CROSS JOIN (VALUES
  ('Ahmedabad', 'ahmedabad', '{}'::text[], 90, 16),
  ('Surat', 'surat', '{}'::text[], 60, 17),
  ('Vadodara', 'vadodara', ARRAY['Baroda']::text[], 60, 18),
  ('Rajkot', 'rajkot', '{}'::text[], 60, 19)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'rajasthan'
CROSS JOIN (VALUES
  ('Jaipur', 'jaipur', '{}'::text[], 60, 20),
  ('Jodhpur', 'jodhpur', '{}'::text[], 60, 21),
  ('Udaipur', 'udaipur', '{}'::text[], 60, 22),
  ('Kota', 'kota', '{}'::text[], 30, 23),
  ('Ajmer', 'ajmer', '{}'::text[], 30, 24)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'uttar-pradesh'
CROSS JOIN (VALUES
  ('Lucknow', 'lucknow', '{}'::text[], 60, 25),
  ('Kanpur', 'kanpur', '{}'::text[], 60, 26),
  ('Agra', 'agra', '{}'::text[], 60, 27),
  ('Varanasi', 'varanasi', ARRAY['Banaras', 'Kashi']::text[], 60, 28),
  ('Ghaziabad', 'ghaziabad', '{}'::text[], 30, 29),
  ('Noida', 'noida', '{}'::text[], 30, 30)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'madhya-pradesh'
CROSS JOIN (VALUES
  ('Indore', 'indore', '{}'::text[], 60, 31),
  ('Bhopal', 'bhopal', '{}'::text[], 60, 32),
  ('Gwalior', 'gwalior', '{}'::text[], 30, 33),
  ('Jabalpur', 'jabalpur', '{}'::text[], 30, 34)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'bihar'
CROSS JOIN (VALUES
  ('Patna', 'patna', '{}'::text[], 60, 35),
  ('Gaya', 'gaya', '{}'::text[], 30, 36),
  ('Muzaffarpur', 'muzaffarpur', '{}'::text[], 30, 37)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'chandigarh'
CROSS JOIN (VALUES
  ('Chandigarh', 'chandigarh', '{}'::text[], 60, 38)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'punjab'
CROSS JOIN (VALUES
  ('Ludhiana', 'ludhiana', '{}'::text[], 60, 39),
  ('Amritsar', 'amritsar', '{}'::text[], 60, 40),
  ('Jalandhar', 'jalandhar', '{}'::text[], 30, 41),
  ('Patiala', 'patiala', '{}'::text[], 30, 42)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'kerala'
CROSS JOIN (VALUES
  ('Kochi', 'kochi', ARRAY['Cochin']::text[], 60, 43),
  ('Thiruvananthapuram', 'thiruvananthapuram', ARRAY['Trivandrum']::text[], 60, 44),
  ('Kozhikode', 'kozhikode', ARRAY['Calicut']::text[], 30, 45)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'odisha'
CROSS JOIN (VALUES
  ('Bhubaneswar', 'bhubaneswar', '{}'::text[], 60, 46),
  ('Cuttack', 'cuttack', '{}'::text[], 30, 47)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'assam'
CROSS JOIN (VALUES
  ('Guwahati', 'guwahati', '{}'::text[], 60, 48),
  ('Silchar', 'silchar', '{}'::text[], 30, 49)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'andhra-pradesh'
CROSS JOIN (VALUES
  ('Visakhapatnam', 'visakhapatnam', ARRAY['Vizag']::text[], 60, 50),
  ('Vijayawada', 'vijayawada', '{}'::text[], 60, 51)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'jharkhand'
CROSS JOIN (VALUES
  ('Ranchi', 'ranchi', '{}'::text[], 60, 52)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'chhattisgarh'
CROSS JOIN (VALUES
  ('Raipur', 'raipur', '{}'::text[], 60, 53)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'uttarakhand'
CROSS JOIN (VALUES
  ('Dehradun', 'dehradun', '{}'::text[], 60, 54),
  ('Haridwar', 'haridwar', '{}'::text[], 30, 55)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'jammu-and-kashmir'
CROSS JOIN (VALUES
  ('Srinagar', 'srinagar', '{}'::text[], 60, 56),
  ('Jammu', 'jammu', '{}'::text[], 60, 57)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'haryana'
CROSS JOIN (VALUES
  ('Gurugram', 'gurugram', ARRAY['Gurgaon']::text[], 30, 58),
  ('Faridabad', 'faridabad', '{}'::text[], 30, 59)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'goa'
CROSS JOIN (VALUES
  ('Panaji', 'panaji', ARRAY['Panjim']::text[], 30, 60)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'himachal-pradesh'
CROSS JOIN (VALUES
  ('Shimla', 'shimla', '{}'::text[], 30, 61)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'meghalaya'
CROSS JOIN (VALUES
  ('Shillong', 'shillong', '{}'::text[], 30, 62)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'manipur'
CROSS JOIN (VALUES
  ('Imphal', 'imphal', '{}'::text[], 30, 63)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'nagaland'
CROSS JOIN (VALUES
  ('Kohima', 'kohima', '{}'::text[], 30, 64)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'tripura'
CROSS JOIN (VALUES
  ('Agartala', 'agartala', '{}'::text[], 30, 65)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'sikkim'
CROSS JOIN (VALUES
  ('Gangtok', 'gangtok', '{}'::text[], 30, 66)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'puducherry'
CROSS JOIN (VALUES
  ('Puducherry', 'puducherry', ARRAY['Pondicherry']::text[], 30, 67)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'ladakh'
CROSS JOIN (VALUES
  ('Leh', 'leh', '{}'::text[], 30, 68)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = 'andaman-and-nicobar-islands'
CROSS JOIN (VALUES
  ('Port Blair', 'port-blair', '{}'::text[], 30, 69)
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


-- Categories (root + children). Reuse Phase 1 Chat Rooms / Girls Chat / Dating Chat IDs.
INSERT INTO public.page_categories (name, slug, description, sort_order, is_active, seo_enabled)
VALUES ('Chat Rooms', 'chat-rooms', 'Root chat room category for SEO pages', 1, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  parent_id = NULL,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Girls Chat', 'girls-chat', 'Girls chat room pages', p.id, 2, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Boys Chat', 'boys-chat', 'Boys chat room pages', p.id, 3, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Friendship Chat', 'friendship-chat', 'Friendship and make-friends chat pages', p.id, 4, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Dating Chat', 'dating-chat', 'Dating chat room pages', p.id, 5, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Random Chat', 'random-chat', 'Random chat pages', p.id, 6, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Free Chat', 'free-chat', 'Free chat room pages', p.id, 7, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Online Chat', 'online-chat', 'Online chat pages', p.id, 8, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Anonymous Chat', 'anonymous-chat', 'Anonymous chat pages', p.id, 9, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'No Signup Chat', 'no-signup-chat', 'No signup chat pages', p.id, 10, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Stranger Chat', 'stranger-chat', 'Stranger chat pages', p.id, 11, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Live Chat', 'live-chat', 'Live chat pages', p.id, 12, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Desi Chat', 'desi-chat', 'Desi chat pages', p.id, 13, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT 'Local Chat', 'local-chat', 'Local chat pages', p.id, 14, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();


-- Keyword groups — city-chat-room UPSERT reuses Phase 1 ID

INSERT INTO public.page_keyword_groups (
  name, slug, primary_pattern, secondary_patterns,
  title_pattern, meta_title_pattern, meta_description_pattern, h1_pattern, slug_pattern, is_active
) VALUES (
  'City Chat Room',
  'city-chat-room',
  '{city} chat room',
  ARRAY['{city} chat rooms', 'online chat in {city}', '{city} online chat', 'free chat room in {city}']::text[],
  '{primary_keyword} | {brand}',
  '{primary_keyword} | Free Online Chat on {brand}',
  'Join free {city} chat rooms on {brand}. Meet people, make friends, and chat online with locals in {city}, {country}.',
  '{primary_keyword}',
  '{city}-chat-room',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_pattern = EXCLUDED.primary_pattern,
  secondary_patterns = EXCLUDED.secondary_patterns,
  title_pattern = EXCLUDED.title_pattern,
  meta_title_pattern = EXCLUDED.meta_title_pattern,
  meta_description_pattern = EXCLUDED.meta_description_pattern,
  h1_pattern = EXCLUDED.h1_pattern,
  slug_pattern = EXCLUDED.slug_pattern,
  is_active = true,
  updated_at = now();


INSERT INTO public.page_keyword_groups (
  name, slug, primary_pattern, secondary_patterns,
  title_pattern, meta_title_pattern, meta_description_pattern, h1_pattern, slug_pattern, is_active
) VALUES (
  'Country Chat Room',
  'country-chat-room',
  '{country} chat room',
  ARRAY['{country} chat rooms', 'online chat in {country}', 'free {country} chat']::text[],
  '{primary_keyword} | {brand}',
  '{primary_keyword} | Free Online Chat on {brand}',
  'Join free {country} chat rooms on {brand}. Meet people across {country} and chat online anytime.',
  '{primary_keyword}',
  '{country}-chat-room',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_pattern = EXCLUDED.primary_pattern,
  secondary_patterns = EXCLUDED.secondary_patterns,
  title_pattern = EXCLUDED.title_pattern,
  meta_title_pattern = EXCLUDED.meta_title_pattern,
  meta_description_pattern = EXCLUDED.meta_description_pattern,
  h1_pattern = EXCLUDED.h1_pattern,
  slug_pattern = EXCLUDED.slug_pattern,
  is_active = true,
  updated_at = now();


INSERT INTO public.page_keyword_groups (
  name, slug, primary_pattern, secondary_patterns,
  title_pattern, meta_title_pattern, meta_description_pattern, h1_pattern, slug_pattern, is_active
) VALUES (
  'City Girls Chat',
  'city-girls-chat',
  '{city} girls chat',
  ARRAY['girls chat room in {city}', 'chat with girls in {city}']::text[],
  '{primary_keyword} | {brand}',
  '{primary_keyword} | {brand}',
  'Join {city} girls chat rooms on {brand}. Chat online and meet people in {city}.',
  '{primary_keyword}',
  '{city}-girls-chat-room',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_pattern = EXCLUDED.primary_pattern,
  secondary_patterns = EXCLUDED.secondary_patterns,
  title_pattern = EXCLUDED.title_pattern,
  meta_title_pattern = EXCLUDED.meta_title_pattern,
  meta_description_pattern = EXCLUDED.meta_description_pattern,
  h1_pattern = EXCLUDED.h1_pattern,
  slug_pattern = EXCLUDED.slug_pattern,
  is_active = true,
  updated_at = now();


INSERT INTO public.page_keyword_groups (
  name, slug, primary_pattern, secondary_patterns,
  title_pattern, meta_title_pattern, meta_description_pattern, h1_pattern, slug_pattern, is_active
) VALUES (
  'City Friendship Chat',
  'city-friendship-chat',
  '{city} friendship chat',
  ARRAY['make friends in {city}', '{city} friends chat room']::text[],
  '{primary_keyword} | {brand}',
  '{primary_keyword} | {brand}',
  'Make friends in {city} with free friendship chat rooms on {brand}.',
  '{primary_keyword}',
  '{city}-friendship-chat-room',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_pattern = EXCLUDED.primary_pattern,
  secondary_patterns = EXCLUDED.secondary_patterns,
  title_pattern = EXCLUDED.title_pattern,
  meta_title_pattern = EXCLUDED.meta_title_pattern,
  meta_description_pattern = EXCLUDED.meta_description_pattern,
  h1_pattern = EXCLUDED.h1_pattern,
  slug_pattern = EXCLUDED.slug_pattern,
  is_active = true,
  updated_at = now();


INSERT INTO public.page_keyword_groups (
  name, slug, primary_pattern, secondary_patterns,
  title_pattern, meta_title_pattern, meta_description_pattern, h1_pattern, slug_pattern, is_active
) VALUES (
  'City Dating Chat',
  'city-dating-chat',
  '{city} dating chat',
  ARRAY['dating chat room in {city}']::text[],
  '{primary_keyword} | {brand}',
  '{primary_keyword} | {brand}',
  'Join dating chat rooms in {city} on {brand}. Chat online safely and meet new people.',
  '{primary_keyword}',
  '{city}-dating-chat-room',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_pattern = EXCLUDED.primary_pattern,
  secondary_patterns = EXCLUDED.secondary_patterns,
  title_pattern = EXCLUDED.title_pattern,
  meta_title_pattern = EXCLUDED.meta_title_pattern,
  meta_description_pattern = EXCLUDED.meta_description_pattern,
  h1_pattern = EXCLUDED.h1_pattern,
  slug_pattern = EXCLUDED.slug_pattern,
  is_active = true,
  updated_at = now();


-- Templates (scaffolds only — no page generation)
-- city-chat-room row was renamed from default-city-chat-room above (same ID).

INSERT INTO public.page_templates (
  name, slug, description,
  title_template, slug_template, h1_template,
  meta_title_template, meta_description_template,
  intro_template, content_template, cta_template, faq_template,
  is_default, is_active
) VALUES (
  'Country Chat Room',
  'country-chat-room',
  'Scaffold for country-level chat room SEO pages. Flat URL e.g. /pakistan-chat-room',
  '{primary_keyword} | {brand}',
  '{country}-chat-room',
  '{primary_keyword}',
  '{primary_keyword} | Free Online Chat on {brand}',
  'Join free {country} chat rooms on {brand}. Meet people across {country} and chat online anytime in {year}.',
  '<p>Welcome to {primary_keyword} on {brand} — a place to meet people across {country}.</p>',
  '<p>Chat online with people from {country}. Explore city chat rooms, make friends, and join live conversations on {brand}.</p><p>Popular locations and categories can be linked from this hub as your Pages CMS grows.</p>',
  '{"label":"Start chatting","href":"/","text":"Join free chat rooms on {brand}"}'::jsonb,
  '[{"q":"Is {country} chat free on {brand}?","a":"Yes. You can join {country} chat rooms on {brand} and start talking online."},{"q":"Can I chat with people from different cities in {country}?","a":"Yes. Country hubs connect you with people across {country}, and city pages help you find local rooms."}]'::jsonb,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  title_template = EXCLUDED.title_template,
  slug_template = EXCLUDED.slug_template,
  h1_template = EXCLUDED.h1_template,
  meta_title_template = EXCLUDED.meta_title_template,
  meta_description_template = EXCLUDED.meta_description_template,
  intro_template = EXCLUDED.intro_template,
  content_template = EXCLUDED.content_template,
  cta_template = EXCLUDED.cta_template,
  faq_template = EXCLUDED.faq_template,
  is_default = EXCLUDED.is_default,
  is_active = true,
  updated_at = now();


INSERT INTO public.page_templates (
  name, slug, description,
  title_template, slug_template, h1_template,
  meta_title_template, meta_description_template,
  intro_template, content_template, cta_template, faq_template,
  is_default, is_active
) VALUES (
  'City Chat Room',
  'city-chat-room',
  'Scaffold for city chat room SEO pages. Flat URL e.g. /lahore-chat-room',
  '{primary_keyword} | {brand}',
  '{city}-chat-room',
  '{primary_keyword}',
  '{primary_keyword} | Free Online Chat on {brand}',
  'Join free {city} chat rooms on {brand}. Meet locals from {city}, {state}, {country} and chat online in {year}.',
  '<p>Welcome to {primary_keyword} on {brand}. Meet people from {city} and start chatting online.</p>',
  '<p>{city} is one of the places where {brand} users meet to chat, make friends, and join live conversations.</p><p>This page is a scaffold — editors can override intro, FAQ, and body content per city without changing the shared template.</p>',
  '{"label":"Join {city} chat","href":"/","text":"Start free chat in {city}"}'::jsonb,
  '[{"q":"How do I join {city} chat rooms?","a":"Open {brand}, pick a chat room, and start messaging people interested in {city}."},{"q":"Is {primary_keyword} free?","a":"Yes. {brand} offers free online chat rooms for {city}."}]'::jsonb,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  title_template = EXCLUDED.title_template,
  slug_template = EXCLUDED.slug_template,
  h1_template = EXCLUDED.h1_template,
  meta_title_template = EXCLUDED.meta_title_template,
  meta_description_template = EXCLUDED.meta_description_template,
  intro_template = EXCLUDED.intro_template,
  content_template = EXCLUDED.content_template,
  cta_template = EXCLUDED.cta_template,
  faq_template = EXCLUDED.faq_template,
  is_default = EXCLUDED.is_default,
  is_active = true,
  updated_at = now();


INSERT INTO public.page_templates (
  name, slug, description,
  title_template, slug_template, h1_template,
  meta_title_template, meta_description_template,
  intro_template, content_template, cta_template, faq_template,
  is_default, is_active
) VALUES (
  'Category Chat Room',
  'category-chat-room',
  'Scaffold for category hubs e.g. /girls-chat-room, /dating-chat-room',
  '{primary_keyword} | {brand}',
  '{category}-room',
  '{primary_keyword}',
  '{primary_keyword} | {brand}',
  'Explore {category} on {brand}. Chat online, meet people, and join free rooms in {year}.',
  '<p>Discover {category} on {brand} — free online chat rooms for people who want to connect.</p>',
  '<p>This category hub introduces {category} across {brand}. City and country pages can link here later without auto-generating every combination yet.</p>',
  '{"label":"Browse chat rooms","href":"/","text":"Join {category} on {brand}"}'::jsonb,
  '[{"q":"What is {category} on {brand}?","a":"{category} rooms help people meet and chat online around a shared interest."}]'::jsonb,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  title_template = EXCLUDED.title_template,
  slug_template = EXCLUDED.slug_template,
  h1_template = EXCLUDED.h1_template,
  meta_title_template = EXCLUDED.meta_title_template,
  meta_description_template = EXCLUDED.meta_description_template,
  intro_template = EXCLUDED.intro_template,
  content_template = EXCLUDED.content_template,
  cta_template = EXCLUDED.cta_template,
  faq_template = EXCLUDED.faq_template,
  is_default = EXCLUDED.is_default,
  is_active = true,
  updated_at = now();


INSERT INTO public.page_templates (
  name, slug, description,
  title_template, slug_template, h1_template,
  meta_title_template, meta_description_template,
  intro_template, content_template, cta_template, faq_template,
  is_default, is_active
) VALUES (
  'City + Category Chat',
  'city-category-chat',
  'Scaffold for later combinations e.g. /lahore-girls-chat-room (not generated in Phase 4A)',
  '{city} {category} | {brand}',
  '{city}-{category}-room',
  '{city} {category}',
  '{city} {category} | {brand}',
  'Join {city} {category} on {brand}. Chat online with people in {city}, {country}.',
  '<p>Welcome to {city} {category} on {brand}.</p>',
  '<p>Use this scaffold for city + category pages. Generate combinations only after a controlled Phase 4B test batch.</p>',
  '{"label":"Start chatting","href":"/","text":"Join {city} {category}"}'::jsonb,
  '[{"q":"Can I find {category} in {city}?","a":"Yes. {brand} supports local {category} conversations for {city}."}]'::jsonb,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  title_template = EXCLUDED.title_template,
  slug_template = EXCLUDED.slug_template,
  h1_template = EXCLUDED.h1_template,
  meta_title_template = EXCLUDED.meta_title_template,
  meta_description_template = EXCLUDED.meta_description_template,
  intro_template = EXCLUDED.intro_template,
  content_template = EXCLUDED.content_template,
  cta_template = EXCLUDED.cta_template,
  faq_template = EXCLUDED.faq_template,
  is_default = EXCLUDED.is_default,
  is_active = true,
  updated_at = now();


-- Ensure only one default template (city-chat-room)
UPDATE public.page_templates SET is_default = false WHERE slug <> 'city-chat-room';
UPDATE public.page_templates SET is_default = true WHERE slug = 'city-chat-room';

-- ---------------------------------------------------------------------------
-- POSTFLIGHT: refuse ambiguous taxonomy after seed
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_detail TEXT;
  v_count INTEGER;
BEGIN
  -- No leftover India punjab-in
  SELECT count(*) INTO v_count
  FROM public.page_states s
  JOIN public.page_countries c ON c.id = s.country_id
  WHERE c.slug = 'india' AND s.slug = 'punjab-in';
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: India still has slug punjab-in';
  END IF;

  -- Exactly one India Punjab
  SELECT count(*) INTO v_count
  FROM public.page_states s
  JOIN public.page_countries c ON c.id = s.country_id
  WHERE c.slug = 'india' AND lower(s.name) = 'punjab';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: India Punjab count = % (expected 1)', v_count;
  END IF;

  -- No default-city-chat-room left; exactly one city-chat-room template
  SELECT count(*) INTO v_count FROM public.page_templates WHERE slug = 'default-city-chat-room';
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: default-city-chat-room still exists';
  END IF;
  SELECT count(*) INTO v_count FROM public.page_templates WHERE slug = 'city-chat-room';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: city-chat-room template count = %', v_count;
  END IF;

  -- Semantic duplicate states (country + normalized name)
  SELECT string_agg(c.slug || ':' || d.name || '(' || d.cnt || ')', ', ') INTO v_detail
  FROM (
    SELECT country_id, lower(name) AS n, max(name) AS name, count(*) AS cnt
    FROM public.page_states
    GROUP BY country_id, lower(name)
    HAVING count(*) > 1
  ) d
  JOIN public.page_countries c ON c.id = d.country_id;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate states: %', v_detail;
  END IF;

  -- Semantic duplicate cities (country + normalized name) — Hyderabad IN vs PK is OK
  SELECT string_agg(c.slug || ':' || d.name || '(' || d.cnt || ')', ', ') INTO v_detail
  FROM (
    SELECT country_id, lower(name) AS n, max(name) AS name, count(*) AS cnt
    FROM public.page_cities
    GROUP BY country_id, lower(name)
    HAVING count(*) > 1
  ) d
  JOIN public.page_countries c ON c.id = d.country_id;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate cities: %', v_detail;
  END IF;

  -- Duplicate category / keyword / template slugs (unique constraints should prevent; assert anyway)
  SELECT string_agg(slug || '(' || cnt || ')', ', ') INTO v_detail
  FROM (SELECT slug, count(*) AS cnt FROM public.page_categories GROUP BY slug HAVING count(*) > 1) x;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate categories: %', v_detail;
  END IF;

  SELECT string_agg(slug || '(' || cnt || ')', ', ') INTO v_detail
  FROM (SELECT slug, count(*) AS cnt FROM public.page_keyword_groups GROUP BY slug HAVING count(*) > 1) x;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate keyword groups: %', v_detail;
  END IF;

  SELECT string_agg(slug || '(' || cnt || ')', ', ') INTO v_detail
  FROM (SELECT slug, count(*) AS cnt FROM public.page_templates GROUP BY slug HAVING count(*) > 1) x;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate templates: %', v_detail;
  END IF;

  -- Girls/Dating must be children of Chat Rooms
  IF EXISTS (
    SELECT 1 FROM public.page_categories child
    JOIN public.page_categories root ON root.slug = 'chat-rooms'
    WHERE child.slug IN ('girls-chat', 'dating-chat')
      AND child.parent_id IS DISTINCT FROM root.id
  ) THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: girls-chat/dating-chat not reparented under chat-rooms';
  END IF;
END $$;
