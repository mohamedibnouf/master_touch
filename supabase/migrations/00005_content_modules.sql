-- Homepage, About, Services, Contact modules

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages (id) ON DELETE SET NULL,
  key TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles (id),
  updated_by UUID REFERENCES public.profiles (id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.homepage_section_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  title TEXT,
  subtitle TEXT,
  body TEXT,
  cta_label TEXT,
  cta_href TEXT,
  extra JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, locale)
);

CREATE TABLE IF NOT EXISTS public.homepage_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.homepage_sections (id) ON DELETE CASCADE,
  media_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles (id),
  updated_by UUID REFERENCES public.profiles (id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.homepage_slide_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id UUID NOT NULL REFERENCES public.homepage_slides (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  title TEXT,
  subtitle TEXT,
  cta_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slide_id, locale)
);

CREATE TABLE IF NOT EXISTS public.about_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT,
  cover_image_url TEXT,
  ceo_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles (id),
  updated_by UUID REFERENCES public.profiles (id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.about_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_id UUID NOT NULL REFERENCES public.about_pages (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  history TEXT,
  vision TEXT,
  mission TEXT,
  objectives TEXT,
  ceo_message TEXT,
  ceo_name TEXT,
  ceo_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (about_id, locale)
);

CREATE TABLE IF NOT EXISTS public.about_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_id UUID NOT NULL REFERENCES public.about_pages (id) ON DELETE CASCADE,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.about_value_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value_id UUID NOT NULL REFERENCES public.about_values (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (value_id, locale)
);

CREATE TABLE IF NOT EXISTS public.about_timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_id UUID NOT NULL REFERENCES public.about_pages (id) ON DELETE CASCADE,
  event_year TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.about_timeline_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id UUID NOT NULL REFERENCES public.about_timeline_items (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (timeline_id, locale)
);

CREATE TABLE IF NOT EXISTS public.about_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_id UUID NOT NULL REFERENCES public.about_pages (id) ON DELETE CASCADE,
  icon TEXT,
  value TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.about_stat_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_id UUID NOT NULL REFERENCES public.about_stats (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (stat_id, locale)
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  cover_image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles (id),
  updated_by UUID REFERENCES public.profiles (id),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.service_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (service_id, locale)
);

CREATE TABLE IF NOT EXISTS public.service_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services (id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.service_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services (id) ON DELETE CASCADE,
  related_service_id UUID NOT NULL REFERENCES public.services (id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (service_id, related_service_id),
  CHECK (service_id <> related_service_id)
);

CREATE TABLE IF NOT EXISTS public.contact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_embed_url TEXT,
  working_hours_json JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_form_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notify_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles (id)
);

CREATE TABLE IF NOT EXISTS public.contact_setting_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id UUID NOT NULL REFERENCES public.contact_settings (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  headline TEXT,
  intro TEXT,
  form_success_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (settings_id, locale)
);

CREATE TABLE IF NOT EXISTS public.contact_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id UUID NOT NULL REFERENCES public.contact_settings (id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contact_branch_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.contact_branches (id) ON DELETE CASCADE,
  locale public.app_locale NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id, locale)
);

CREATE TABLE IF NOT EXISTS public.contact_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id UUID NOT NULL REFERENCES public.contact_settings (id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.contact_branches (id) ON DELETE SET NULL,
  channel_type public.contact_channel_type NOT NULL,
  value TEXT NOT NULL,
  label TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status public.contact_message_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES public.profiles (id),
  reply_notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
