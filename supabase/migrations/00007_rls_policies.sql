-- Row Level Security policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_section_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_slide_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_value_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_stat_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_setting_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_branch_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own_or_manage ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.has_permission(auth.uid(), 'users.view')
    OR public.has_permission(auth.uid(), 'users.manage')
  );

CREATE POLICY profiles_update_own_or_manage ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR public.has_permission(auth.uid(), 'users.manage')
  );

-- Public read helpers for published content
CREATE POLICY pages_public_read ON public.pages
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY pages_admin_all ON public.pages
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  );

CREATE POLICY page_translations_public_read ON public.page_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY page_seo_public_read ON public.page_seo
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY translations_public_read ON public.translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY translations_admin_write ON public.translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'translations.update')
    OR public.has_permission(auth.uid(), 'translations.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'translations.update')
    OR public.has_permission(auth.uid(), 'translations.manage')
  );

CREATE POLICY namespaces_public_read ON public.translation_namespaces
  FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

-- Homepage
CREATE POLICY homepage_sections_public_read ON public.homepage_sections
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY homepage_sections_admin ON public.homepage_sections
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.view')
    OR public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_section_tr_public ON public.homepage_section_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY homepage_section_tr_admin ON public.homepage_section_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_slides_public ON public.homepage_slides
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY homepage_slides_admin ON public.homepage_slides
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_slide_tr_public ON public.homepage_slide_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY homepage_slide_tr_admin ON public.homepage_slide_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

-- About
CREATE POLICY about_public_read ON public.about_pages
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY about_admin ON public.about_pages
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_tr_public ON public.about_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY about_tr_admin ON public.about_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_values_public ON public.about_values
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY about_values_admin ON public.about_values
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_value_tr_public ON public.about_value_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY about_value_tr_admin ON public.about_value_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_timeline_public ON public.about_timeline_items
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY about_timeline_admin ON public.about_timeline_items
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_timeline_tr_public ON public.about_timeline_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY about_timeline_tr_admin ON public.about_timeline_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_stats_public ON public.about_stats
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY about_stats_admin ON public.about_stats
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_stat_tr_public ON public.about_stat_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY about_stat_tr_admin ON public.about_stat_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

-- Services
CREATE POLICY services_public_read ON public.services
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE AND deleted_at IS NULL AND status = 'published');

CREATE POLICY services_admin ON public.services
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.view')
    OR public.has_permission(auth.uid(), 'services.create')
    OR public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.create')
    OR public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_tr_public ON public.service_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY service_tr_admin ON public.service_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_gallery_public ON public.service_gallery
  FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

CREATE POLICY service_gallery_admin ON public.service_gallery
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_relations_public ON public.service_relations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY service_relations_admin ON public.service_relations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

-- Contact
CREATE POLICY contact_settings_public ON public.contact_settings
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY contact_settings_admin ON public.contact_settings
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_setting_tr_public ON public.contact_setting_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY contact_setting_tr_admin ON public.contact_setting_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_branches_public ON public.contact_branches
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY contact_branches_admin ON public.contact_branches
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_branch_tr_public ON public.contact_branch_translations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY contact_branch_tr_admin ON public.contact_branch_translations
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_channels_public ON public.contact_channels
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY contact_channels_admin ON public.contact_channels
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_messages_insert_public ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY contact_messages_admin ON public.contact_messages
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact_messages.view')
    OR public.has_permission(auth.uid(), 'contact_messages.update')
    OR public.has_permission(auth.uid(), 'contact_messages.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact_messages.update')
    OR public.has_permission(auth.uid(), 'contact_messages.manage')
  );

-- Media
CREATE POLICY media_folders_admin ON public.media_folders
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'media.view')
    OR public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.manage')
  );

CREATE POLICY media_assets_public ON public.media_assets
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY media_assets_admin ON public.media_assets
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'media.view')
    OR public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.update')
    OR public.has_permission(auth.uid(), 'media.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.update')
    OR public.has_permission(auth.uid(), 'media.manage')
  );

-- Theme & settings
CREATE POLICY theme_public_read ON public.theme_settings
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY theme_admin ON public.theme_settings
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'theme.view')
    OR public.has_permission(auth.uid(), 'theme.manage')
  )
  WITH CHECK (public.has_permission(auth.uid(), 'theme.manage'));

CREATE POLICY site_settings_public ON public.site_settings
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY site_settings_admin ON public.site_settings
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'settings.view')
    OR public.has_permission(auth.uid(), 'settings.manage')
  )
  WITH CHECK (public.has_permission(auth.uid(), 'settings.manage'));

-- RBAC admin
CREATE POLICY roles_admin ON public.roles
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'roles.view')
    OR public.has_permission(auth.uid(), 'roles.manage')
  )
  WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY permissions_read ON public.permissions
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'roles.view')
    OR public.has_permission(auth.uid(), 'roles.manage')
  );

CREATE POLICY role_permissions_admin ON public.role_permissions
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'roles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY user_roles_admin ON public.user_roles
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'users.view')
    OR public.has_permission(auth.uid(), 'users.manage')
  )
  WITH CHECK (public.has_permission(auth.uid(), 'users.manage'));

CREATE POLICY audit_logs_admin ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'audit_logs.view')
    OR public.has_permission(auth.uid(), 'audit_logs.manage')
  );

CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);
