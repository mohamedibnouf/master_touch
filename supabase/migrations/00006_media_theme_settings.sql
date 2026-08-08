-- Media, theme, site settings

CREATE TABLE IF NOT EXISTS public.media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.media_folders (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles (id),
  updated_by UUID REFERENCES public.profiles (id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES public.media_folders (id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  mime_type TEXT,
  media_type public.media_type NOT NULL DEFAULT 'image',
  size_bytes BIGINT,
  width INT,
  height INT,
  alt_text TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles (id),
  updated_by UUID REFERENCES public.profiles (id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color TEXT NOT NULL DEFAULT '#0a1b33',
  secondary_color TEXT NOT NULL DEFAULT '#132a4a',
  accent_color TEXT NOT NULL DEFAULT '#1e5eff',
  background_color TEXT NOT NULL DEFAULT '#f4f6f9',
  foreground_color TEXT NOT NULL DEFAULT '#0a1628',
  font_sans TEXT NOT NULL DEFAULT 'Source Sans 3',
  font_display TEXT NOT NULL DEFAULT 'Outfit',
  border_radius TEXT NOT NULL DEFAULT '0.125rem',
  button_style JSONB NOT NULL DEFAULT '{"variant":"solid","radius":"0.125rem"}'::JSONB,
  card_style JSONB NOT NULL DEFAULT '{"glass":true,"radius":"1rem"}'::JSONB,
  animation_settings JSONB NOT NULL DEFAULT '{"enabled":true,"intensity":"medium"}'::JSONB,
  dark_mode_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  logo_light_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  loader_url TEXT,
  custom_css TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles (id)
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name_i18n JSONB NOT NULL DEFAULT '{"ar":"ماستر تاتش","en":"Master Touch"}'::JSONB,
  tagline_i18n JSONB NOT NULL DEFAULT '{}'::JSONB,
  default_locale public.app_locale NOT NULL DEFAULT 'ar',
  supported_locales public.app_locale[] NOT NULL DEFAULT ARRAY['ar','en']::public.app_locale[],
  website_url TEXT DEFAULT 'https://www.mastertouch-ksa.com',
  social_links JSONB NOT NULL DEFAULT '{}'::JSONB,
  header_settings JSONB NOT NULL DEFAULT '{"sticky":true,"transparent":false}'::JSONB,
  footer_settings JSONB NOT NULL DEFAULT '{}'::JSONB,
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles (id)
);
