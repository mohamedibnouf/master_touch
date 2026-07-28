-- Indexes and updated_at triggers

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles (deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles (role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions (module);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages (slug);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_sort ON public.homepage_sections (sort_order);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services (slug);
CREATE INDEX IF NOT EXISTS idx_services_published ON public.services (is_published, deleted_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages (status);
CREATE INDEX IF NOT EXISTS idx_translations_key ON public.translations (key);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON public.media_assets (folder_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'roles', 'pages', 'page_translations', 'page_seo',
    'translations', 'homepage_sections', 'homepage_section_translations',
    'homepage_slides', 'homepage_slide_translations', 'about_pages',
    'about_translations', 'about_values', 'about_value_translations',
    'about_timeline_items', 'about_timeline_translations', 'about_stats',
    'about_stat_translations', 'services', 'service_translations',
    'contact_settings', 'contact_setting_translations', 'contact_branches',
    'contact_branch_translations', 'contact_channels', 'contact_messages',
    'media_folders', 'media_assets', 'theme_settings', 'site_settings'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%I;
       CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;
