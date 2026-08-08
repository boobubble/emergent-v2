-- Phase 4B.1 — City/Country template differentiation + CTA/FAQ scaffolds
-- Updates page_templates only. Does NOT create or publish custom_pages.
-- City slug policy is enforced in application code (bulk-generate), not SQL.

UPDATE public.page_templates
SET
  description = 'Scaffold for country-level chat room SEO pages. Flat URL e.g. /pakistan-chat-room',
  intro_template = '<p>Welcome to {primary_keyword} on {brand} — a place to meet people across {country}.</p>',
  content_template = '<section data-block="intro"><p>Chat online with people from {country} on {brand}. This country hub is the starting point for city rooms and topic rooms.</p></section><section data-block="location"><p>Browse conversations connected to {country}. City pages help you narrow the room when you want a more local circle.</p></section><section data-block="how_it_works"><p>Pick a room, say hello, and keep chatting. Editors can override this scaffold per country without changing the shared template.</p></section>',
  meta_description_template = 'Join free {country} chat rooms on {brand}. Meet people across {country} and chat online anytime in {year}.',
  cta_template = '{"label":"Start chatting in {country}","href":"/","text":"Join free {country} chat rooms on {brand}"}'::jsonb,
  faq_template = '[{"q":"Is {country} chat free on {brand}?","a":"Yes. You can join {country} chat rooms on {brand} and start talking online without a complicated signup flow."},{"q":"Can I chat with people from different cities in {country}?","a":"Yes. This {country} hub connects you across the country, and city pages help you find more local rooms when you want them."},{"q":"How is this different from a city chat room?","a":"Country pages cover {country} broadly. City pages focus on one place (for example a specific city chat room under {country})."}]'::jsonb,
  updated_at = now()
WHERE slug = 'country-chat-room';

UPDATE public.page_templates
SET
  description = 'City chat room SEO scaffold. Unique cities use /{city}-chat-room; same name across countries uses /{city}-{country}-chat-room.',
  intro_template = '<p>Welcome to {primary_keyword} on {brand}. Meet people connected to {city} ({region_label}) and start chatting online.</p>',
  content_template = '<section data-block="location"><h2>About this {city} hub</h2><p>{location_context}</p><p>{language_note}</p></section><section data-block="nearby"><h2>Related city chat rooms</h2><p>People exploring {city} often also browse nearby or related rooms in {country}:</p>{nearby_cities_html}</section><section data-block="country_context"><h2>{country_hub_label}</h2><p>{country_context}</p></section><section data-block="how_it_works"><h2>How {brand} chat works here</h2><p>Open a room tied to {region_label}, introduce yourself, and talk with people interested in {city}. Editors can override intro, FAQ, CTA, and body sections per city without changing this shared template.</p></section>',
  meta_description_template = 'Join free {city} chat rooms on {brand}. Meet people connected to {city} in {state}, {country} and chat online in {year}.',
  cta_template = '{"label":"Join {city} chat","href":"/","text":"Start free chat connected to {city}, {country}"}'::jsonb,
  faq_template = '[{"q":"How do I join {city} chat rooms on {brand}?","a":"Open {brand}, choose a room related to {city} in {state}, {country}, and start messaging."},{"q":"Is {primary_keyword} free?","a":"Yes. {brand} offers free online chat rooms for people connected to {city}."},{"q":"What other rooms pair well with {city}?","a":"Try related rooms such as {nearby_cities}, or open the {country_hub_label} hub for a wider {country} audience."}]'::jsonb,
  updated_at = now()
WHERE slug = 'city-chat-room';
