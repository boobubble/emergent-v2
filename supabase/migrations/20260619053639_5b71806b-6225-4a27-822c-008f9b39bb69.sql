DROP POLICY IF EXISTS "Anon read non-sensitive settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated read non-sensitive settings" ON public.app_settings;

CREATE POLICY "Anon read non-sensitive settings" ON public.app_settings
FOR SELECT TO anon
USING (key <> ALL (ARRAY[
  'bots','automation','fake_activity','moderation','security','word_filters',
  'ai_chatbots','admin_modules','staff_permissions','admin_roles','filters',
  'boobubble_openai_key','boobubble_gemini_key','ai_chat'
]));

CREATE POLICY "Authenticated read non-sensitive settings" ON public.app_settings
FOR SELECT TO authenticated
USING (
  (key <> ALL (ARRAY[
    'bots','automation','fake_activity','moderation','security','word_filters',
    'ai_chatbots','admin_modules','staff_permissions','admin_roles','filters',
    'boobubble_openai_key','boobubble_gemini_key','ai_chat'
  ])) OR is_admin(auth.uid())
);