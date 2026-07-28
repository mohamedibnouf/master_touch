INSERT INTO public.theme_settings (
  id,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  foreground_color,
  font_sans,
  font_display,
  border_radius,
  dark_mode_enabled
)
VALUES (
  '22222222-2222-2222-2222-222222222001',
  '#0B1F3A',
  '#132F54',
  '#E87722',
  '#FFFFFF',
  '#0F172A',
  'Manrope',
  'Cormorant Garamond',
  '0.75rem',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_settings (
  id,
  site_name_i18n,
  tagline_i18n,
  default_locale,
  website_url,
  social_links,
  header_settings,
  footer_settings
)
VALUES (
  '22222222-2222-2222-2222-222222222002',
  '{"ar":"ماستر تاتش","en":"Master Touch"}'::JSONB,
  '{"ar":"اللمسة الأخيرة نحو التميز والتقنية","en":"The final touch toward excellence and technology"}'::JSONB,
  'ar',
  'https://www.mastertouchksa.com',
  '{"linkedin":"","twitter":"","instagram":"","youtube":""}'::JSONB,
  '{"sticky":true,"transparent":true,"announcement_enabled":false}'::JSONB,
  '{"show_newsletter":false,"show_social":true}'::JSONB
)
ON CONFLICT (id) DO NOTHING;
