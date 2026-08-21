-- Activate Instagram as a first-class social platform (templates + Facebook OFF).
-- Does NOT enable social_signup_enabled.

UPDATE public.social_caption_templates
SET
  template = E'🎉 {{display_name}} just joined Yaarzo!\nSay hello to our newest community member 👋\n💬 Meet {{display_name}}:\n{{profile_url}}\n#Yaarzo #NewMember #Chat #Community #MakeFriends',
  updated_at = now()
WHERE platform = 'instagram';

INSERT INTO public.social_caption_templates (platform, template)
VALUES (
  'instagram',
  E'🎉 {{display_name}} just joined Yaarzo!\nSay hello to our newest community member 👋\n💬 Meet {{display_name}}:\n{{profile_url}}\n#Yaarzo #NewMember #Chat #Community #MakeFriends'
)
ON CONFLICT (platform) DO NOTHING;

-- Keep Facebook integration intact but Auto Posting OFF for current setup.
UPDATE public.social_channels
SET enabled = false, updated_at = now()
WHERE platform = 'facebook' AND enabled = true;
