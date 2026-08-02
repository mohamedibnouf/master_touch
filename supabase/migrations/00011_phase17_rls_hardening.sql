-- Phase 1.7: RLS hardening
-- - Split FOR ALL policies so DELETE never inherits *.view
-- - Fix permission self-read via get_my_permission_keys()
-- - Lock down assign_super_admin to service_role
-- - Add write policies for page_translations / page_seo
-- - Drop permissive audit_logs INSERT (service role bypasses RLS)
-- - Split storage write vs DELETE

-- ---------------------------------------------------------------------------
-- Helper: current user's permission keys (SECURITY DEFINER — self-read)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_permission_keys()
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  keys TEXT[];
BEGIN
  IF uid IS NULL THEN
    RETURN ARRAY[]::TEXT[];
  END IF;

  IF public.is_super_admin(uid) THEN
    RETURN ARRAY['*']::TEXT[];
  END IF;

  SELECT COALESCE(
    ARRAY(
      SELECT DISTINCT p.key
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON rp.role_id = ur.role_id
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = uid
        AND p.deleted_at IS NULL
      ORDER BY 1
    ),
    ARRAY[]::TEXT[]
  )
  INTO keys;

  RETURN keys;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_permission_keys() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_permission_keys() TO authenticated;

-- ---------------------------------------------------------------------------
-- assign_super_admin (moved from seed; executable only by service_role / postgres)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_super_admin(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id UUID;
BEGIN
  SELECT id INTO v_role_id
  FROM public.roles
  WHERE slug = 'super_admin' AND deleted_at IS NULL;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'super_admin role missing — run seed 01_roles_permissions.sql first';
  END IF;

  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  UPDATE public.profiles
  SET is_active = TRUE, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_super_admin(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assign_super_admin(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.assign_super_admin(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.assign_super_admin(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_super_admin(UUID) TO postgres;

-- ===========================================================================
-- DROP existing table policies from 00007_rls_policies.sql
-- ===========================================================================

-- Profiles
DROP POLICY IF EXISTS profiles_select_own_or_manage ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own_or_manage ON public.profiles;

-- Pages / SEO / translations
DROP POLICY IF EXISTS pages_public_read ON public.pages;
DROP POLICY IF EXISTS pages_admin_all ON public.pages;
DROP POLICY IF EXISTS page_translations_public_read ON public.page_translations;
DROP POLICY IF EXISTS page_seo_public_read ON public.page_seo;
DROP POLICY IF EXISTS translations_public_read ON public.translations;
DROP POLICY IF EXISTS translations_admin_write ON public.translations;
DROP POLICY IF EXISTS namespaces_public_read ON public.translation_namespaces;

-- Homepage
DROP POLICY IF EXISTS homepage_sections_public_read ON public.homepage_sections;
DROP POLICY IF EXISTS homepage_sections_admin ON public.homepage_sections;
DROP POLICY IF EXISTS homepage_section_tr_public ON public.homepage_section_translations;
DROP POLICY IF EXISTS homepage_section_tr_admin ON public.homepage_section_translations;
DROP POLICY IF EXISTS homepage_slides_public ON public.homepage_slides;
DROP POLICY IF EXISTS homepage_slides_admin ON public.homepage_slides;
DROP POLICY IF EXISTS homepage_slide_tr_public ON public.homepage_slide_translations;
DROP POLICY IF EXISTS homepage_slide_tr_admin ON public.homepage_slide_translations;

-- About
DROP POLICY IF EXISTS about_public_read ON public.about_pages;
DROP POLICY IF EXISTS about_admin ON public.about_pages;
DROP POLICY IF EXISTS about_tr_public ON public.about_translations;
DROP POLICY IF EXISTS about_tr_admin ON public.about_translations;
DROP POLICY IF EXISTS about_values_public ON public.about_values;
DROP POLICY IF EXISTS about_values_admin ON public.about_values;
DROP POLICY IF EXISTS about_value_tr_public ON public.about_value_translations;
DROP POLICY IF EXISTS about_value_tr_admin ON public.about_value_translations;
DROP POLICY IF EXISTS about_timeline_public ON public.about_timeline_items;
DROP POLICY IF EXISTS about_timeline_admin ON public.about_timeline_items;
DROP POLICY IF EXISTS about_timeline_tr_public ON public.about_timeline_translations;
DROP POLICY IF EXISTS about_timeline_tr_admin ON public.about_timeline_translations;
DROP POLICY IF EXISTS about_stats_public ON public.about_stats;
DROP POLICY IF EXISTS about_stats_admin ON public.about_stats;
DROP POLICY IF EXISTS about_stat_tr_public ON public.about_stat_translations;
DROP POLICY IF EXISTS about_stat_tr_admin ON public.about_stat_translations;

-- Services
DROP POLICY IF EXISTS services_public_read ON public.services;
DROP POLICY IF EXISTS services_admin ON public.services;
DROP POLICY IF EXISTS service_tr_public ON public.service_translations;
DROP POLICY IF EXISTS service_tr_admin ON public.service_translations;
DROP POLICY IF EXISTS service_gallery_public ON public.service_gallery;
DROP POLICY IF EXISTS service_gallery_admin ON public.service_gallery;
DROP POLICY IF EXISTS service_relations_public ON public.service_relations;
DROP POLICY IF EXISTS service_relations_admin ON public.service_relations;

-- Contact
DROP POLICY IF EXISTS contact_settings_public ON public.contact_settings;
DROP POLICY IF EXISTS contact_settings_admin ON public.contact_settings;
DROP POLICY IF EXISTS contact_setting_tr_public ON public.contact_setting_translations;
DROP POLICY IF EXISTS contact_setting_tr_admin ON public.contact_setting_translations;
DROP POLICY IF EXISTS contact_branches_public ON public.contact_branches;
DROP POLICY IF EXISTS contact_branches_admin ON public.contact_branches;
DROP POLICY IF EXISTS contact_branch_tr_public ON public.contact_branch_translations;
DROP POLICY IF EXISTS contact_branch_tr_admin ON public.contact_branch_translations;
DROP POLICY IF EXISTS contact_channels_public ON public.contact_channels;
DROP POLICY IF EXISTS contact_channels_admin ON public.contact_channels;
DROP POLICY IF EXISTS contact_messages_insert_public ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_admin ON public.contact_messages;

-- Media
DROP POLICY IF EXISTS media_folders_admin ON public.media_folders;
DROP POLICY IF EXISTS media_assets_public ON public.media_assets;
DROP POLICY IF EXISTS media_assets_admin ON public.media_assets;

-- Theme & settings
DROP POLICY IF EXISTS theme_public_read ON public.theme_settings;
DROP POLICY IF EXISTS theme_admin ON public.theme_settings;
DROP POLICY IF EXISTS site_settings_public ON public.site_settings;
DROP POLICY IF EXISTS site_settings_admin ON public.site_settings;

-- RBAC
DROP POLICY IF EXISTS roles_admin ON public.roles;
DROP POLICY IF EXISTS permissions_read ON public.permissions;
DROP POLICY IF EXISTS role_permissions_admin ON public.role_permissions;
DROP POLICY IF EXISTS user_roles_admin ON public.user_roles;
DROP POLICY IF EXISTS audit_logs_admin ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;

-- ===========================================================================
-- DROP existing storage policies from 00008_storage_buckets.sql
-- ===========================================================================
DROP POLICY IF EXISTS public_assets_read ON storage.objects;
DROP POLICY IF EXISTS public_assets_write ON storage.objects;
DROP POLICY IF EXISTS media_bucket_read ON storage.objects;
DROP POLICY IF EXISTS media_bucket_write ON storage.objects;

-- ===========================================================================
-- RECREATE table policies (command-separated)
-- Pattern: SELECT = view|update|manage; INSERT/UPDATE = create|update|manage;
--          DELETE = manage only (never view)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
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
  )
  WITH CHECK (
    id = auth.uid()
    OR public.has_permission(auth.uid(), 'users.manage')
  );

-- ---------------------------------------------------------------------------
-- Pages
-- ---------------------------------------------------------------------------
CREATE POLICY pages_public_read ON public.pages
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY pages_admin_select ON public.pages
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  );

CREATE POLICY pages_admin_insert ON public.pages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  );

CREATE POLICY pages_admin_update ON public.pages
  FOR UPDATE TO authenticated
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

CREATE POLICY pages_admin_delete ON public.pages
  FOR DELETE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  );

-- page_translations: public SELECT + admin write
CREATE POLICY page_translations_public_read ON public.page_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY page_translations_admin_insert ON public.page_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'settings.manage')
    OR public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY page_translations_admin_update ON public.page_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'settings.manage')
    OR public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'settings.manage')
    OR public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY page_translations_admin_delete ON public.page_translations
  FOR DELETE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'settings.manage')
    OR public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

-- page_seo: public SELECT + admin write
CREATE POLICY page_seo_public_read ON public.page_seo
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY page_seo_admin_insert ON public.page_seo
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'settings.manage')
    OR public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY page_seo_admin_update ON public.page_seo
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'settings.manage')
    OR public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'settings.manage')
    OR public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY page_seo_admin_delete ON public.page_seo
  FOR DELETE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'settings.manage')
    OR public.has_permission(auth.uid(), 'homepage.manage')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

-- Translations (i18n keys)
CREATE POLICY translations_public_read ON public.translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY translations_admin_insert ON public.translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'translations.update')
    OR public.has_permission(auth.uid(), 'translations.manage')
  );

CREATE POLICY translations_admin_update ON public.translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'translations.update')
    OR public.has_permission(auth.uid(), 'translations.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'translations.update')
    OR public.has_permission(auth.uid(), 'translations.manage')
  );

CREATE POLICY translations_admin_delete ON public.translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'translations.manage'));

CREATE POLICY namespaces_public_read ON public.translation_namespaces
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ---------------------------------------------------------------------------
-- Homepage
-- ---------------------------------------------------------------------------
CREATE POLICY homepage_sections_public_read ON public.homepage_sections
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY homepage_sections_admin_select ON public.homepage_sections
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.view')
    OR public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_sections_admin_insert ON public.homepage_sections
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_sections_admin_update ON public.homepage_sections
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_sections_admin_delete ON public.homepage_sections
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'homepage.manage'));

CREATE POLICY homepage_section_tr_public ON public.homepage_section_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY homepage_section_tr_admin_select ON public.homepage_section_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.view')
    OR public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_section_tr_admin_insert ON public.homepage_section_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_section_tr_admin_update ON public.homepage_section_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_section_tr_admin_delete ON public.homepage_section_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'homepage.manage'));

CREATE POLICY homepage_slides_public ON public.homepage_slides
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY homepage_slides_admin_select ON public.homepage_slides
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.view')
    OR public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_slides_admin_insert ON public.homepage_slides
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_slides_admin_update ON public.homepage_slides
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_slides_admin_delete ON public.homepage_slides
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'homepage.manage'));

CREATE POLICY homepage_slide_tr_public ON public.homepage_slide_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY homepage_slide_tr_admin_select ON public.homepage_slide_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.view')
    OR public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_slide_tr_admin_insert ON public.homepage_slide_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_slide_tr_admin_update ON public.homepage_slide_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'homepage.update')
    OR public.has_permission(auth.uid(), 'homepage.manage')
  );

CREATE POLICY homepage_slide_tr_admin_delete ON public.homepage_slide_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'homepage.manage'));

-- ---------------------------------------------------------------------------
-- About
-- ---------------------------------------------------------------------------
CREATE POLICY about_public_read ON public.about_pages
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY about_admin_select ON public.about_pages
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_admin_insert ON public.about_pages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_admin_update ON public.about_pages
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_admin_delete ON public.about_pages
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'about.manage'));

CREATE POLICY about_tr_public ON public.about_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY about_tr_admin_select ON public.about_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_tr_admin_insert ON public.about_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_tr_admin_update ON public.about_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_tr_admin_delete ON public.about_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'about.manage'));

CREATE POLICY about_values_public ON public.about_values
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY about_values_admin_select ON public.about_values
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_values_admin_insert ON public.about_values
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_values_admin_update ON public.about_values
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_values_admin_delete ON public.about_values
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'about.manage'));

CREATE POLICY about_value_tr_public ON public.about_value_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY about_value_tr_admin_select ON public.about_value_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_value_tr_admin_insert ON public.about_value_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_value_tr_admin_update ON public.about_value_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_value_tr_admin_delete ON public.about_value_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'about.manage'));

CREATE POLICY about_timeline_public ON public.about_timeline_items
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY about_timeline_admin_select ON public.about_timeline_items
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_timeline_admin_insert ON public.about_timeline_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_timeline_admin_update ON public.about_timeline_items
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_timeline_admin_delete ON public.about_timeline_items
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'about.manage'));

CREATE POLICY about_timeline_tr_public ON public.about_timeline_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY about_timeline_tr_admin_select ON public.about_timeline_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_timeline_tr_admin_insert ON public.about_timeline_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_timeline_tr_admin_update ON public.about_timeline_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_timeline_tr_admin_delete ON public.about_timeline_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'about.manage'));

CREATE POLICY about_stats_public ON public.about_stats
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY about_stats_admin_select ON public.about_stats
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_stats_admin_insert ON public.about_stats
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_stats_admin_update ON public.about_stats
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_stats_admin_delete ON public.about_stats
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'about.manage'));

CREATE POLICY about_stat_tr_public ON public.about_stat_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY about_stat_tr_admin_select ON public.about_stat_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.view')
    OR public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_stat_tr_admin_insert ON public.about_stat_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_stat_tr_admin_update ON public.about_stat_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'about.update')
    OR public.has_permission(auth.uid(), 'about.manage')
  );

CREATE POLICY about_stat_tr_admin_delete ON public.about_stat_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'about.manage'));

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
CREATE POLICY services_public_read ON public.services
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE AND deleted_at IS NULL AND status = 'published');

CREATE POLICY services_admin_select ON public.services
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.view')
    OR public.has_permission(auth.uid(), 'services.create')
    OR public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY services_admin_insert ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.create')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY services_admin_update ON public.services
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY services_admin_delete ON public.services
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'services.manage'));

CREATE POLICY service_tr_public ON public.service_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY service_tr_admin_select ON public.service_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.view')
    OR public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_tr_admin_insert ON public.service_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_tr_admin_update ON public.service_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_tr_admin_delete ON public.service_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'services.manage'));

CREATE POLICY service_gallery_public ON public.service_gallery
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY service_gallery_admin_select ON public.service_gallery
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.view')
    OR public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_gallery_admin_insert ON public.service_gallery
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_gallery_admin_update ON public.service_gallery
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_gallery_admin_delete ON public.service_gallery
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'services.manage'));

CREATE POLICY service_relations_public ON public.service_relations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY service_relations_admin_select ON public.service_relations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.view')
    OR public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_relations_admin_insert ON public.service_relations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_relations_admin_update ON public.service_relations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'services.update')
    OR public.has_permission(auth.uid(), 'services.manage')
  );

CREATE POLICY service_relations_admin_delete ON public.service_relations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'services.manage'));

-- ---------------------------------------------------------------------------
-- Contact CMS
-- ---------------------------------------------------------------------------
CREATE POLICY contact_settings_public ON public.contact_settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY contact_settings_admin_select ON public.contact_settings
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.view')
    OR public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_settings_admin_insert ON public.contact_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_settings_admin_update ON public.contact_settings
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_settings_admin_delete ON public.contact_settings
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'contact.manage'));

CREATE POLICY contact_setting_tr_public ON public.contact_setting_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY contact_setting_tr_admin_select ON public.contact_setting_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.view')
    OR public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_setting_tr_admin_insert ON public.contact_setting_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_setting_tr_admin_update ON public.contact_setting_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_setting_tr_admin_delete ON public.contact_setting_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'contact.manage'));

CREATE POLICY contact_branches_public ON public.contact_branches
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY contact_branches_admin_select ON public.contact_branches
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.view')
    OR public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_branches_admin_insert ON public.contact_branches
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_branches_admin_update ON public.contact_branches
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_branches_admin_delete ON public.contact_branches
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'contact.manage'));

CREATE POLICY contact_branch_tr_public ON public.contact_branch_translations
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY contact_branch_tr_admin_select ON public.contact_branch_translations
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.view')
    OR public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_branch_tr_admin_insert ON public.contact_branch_translations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_branch_tr_admin_update ON public.contact_branch_translations
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_branch_tr_admin_delete ON public.contact_branch_translations
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'contact.manage'));

CREATE POLICY contact_channels_public ON public.contact_channels
  FOR SELECT TO anon, authenticated
  USING (is_enabled = TRUE AND deleted_at IS NULL);

CREATE POLICY contact_channels_admin_select ON public.contact_channels
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.view')
    OR public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_channels_admin_insert ON public.contact_channels
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_channels_admin_update ON public.contact_channels
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact.update')
    OR public.has_permission(auth.uid(), 'contact.manage')
  );

CREATE POLICY contact_channels_admin_delete ON public.contact_channels
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'contact.manage'));

-- Contact messages: public INSERT; admin read/write via contact_messages.* OR contact.manage / settings.manage
CREATE POLICY contact_messages_insert_public ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY contact_messages_admin_select ON public.contact_messages
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact_messages.view')
    OR public.has_permission(auth.uid(), 'contact_messages.update')
    OR public.has_permission(auth.uid(), 'contact_messages.manage')
    OR public.has_permission(auth.uid(), 'contact.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  );

CREATE POLICY contact_messages_admin_update ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact_messages.update')
    OR public.has_permission(auth.uid(), 'contact_messages.manage')
    OR public.has_permission(auth.uid(), 'contact.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'contact_messages.update')
    OR public.has_permission(auth.uid(), 'contact_messages.manage')
    OR public.has_permission(auth.uid(), 'contact.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  );

CREATE POLICY contact_messages_admin_delete ON public.contact_messages
  FOR DELETE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'contact_messages.manage')
    OR public.has_permission(auth.uid(), 'contact.manage')
    OR public.has_permission(auth.uid(), 'settings.manage')
  );

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------
CREATE POLICY media_folders_admin_select ON public.media_folders
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'media.view')
    OR public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.update')
    OR public.has_permission(auth.uid(), 'media.manage')
  );

CREATE POLICY media_folders_admin_insert ON public.media_folders
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.manage')
  );

CREATE POLICY media_folders_admin_update ON public.media_folders
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.update')
    OR public.has_permission(auth.uid(), 'media.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.update')
    OR public.has_permission(auth.uid(), 'media.manage')
  );

CREATE POLICY media_folders_admin_delete ON public.media_folders
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'media.manage'));

CREATE POLICY media_assets_public ON public.media_assets
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY media_assets_admin_select ON public.media_assets
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'media.view')
    OR public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.update')
    OR public.has_permission(auth.uid(), 'media.manage')
  );

CREATE POLICY media_assets_admin_insert ON public.media_assets
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'media.create')
    OR public.has_permission(auth.uid(), 'media.manage')
  );

CREATE POLICY media_assets_admin_update ON public.media_assets
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'media.update')
    OR public.has_permission(auth.uid(), 'media.manage')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'media.update')
    OR public.has_permission(auth.uid(), 'media.manage')
  );

CREATE POLICY media_assets_admin_delete ON public.media_assets
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'media.manage'));

-- ---------------------------------------------------------------------------
-- Theme & site settings
-- ---------------------------------------------------------------------------
CREATE POLICY theme_public_read ON public.theme_settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY theme_admin_select ON public.theme_settings
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'theme.view')
    OR public.has_permission(auth.uid(), 'theme.manage')
  );

CREATE POLICY theme_admin_insert ON public.theme_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'theme.manage'));

CREATE POLICY theme_admin_update ON public.theme_settings
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'theme.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'theme.manage'));

CREATE POLICY theme_admin_delete ON public.theme_settings
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'theme.manage'));

CREATE POLICY site_settings_public ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY site_settings_admin_select ON public.site_settings
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'settings.view')
    OR public.has_permission(auth.uid(), 'settings.manage')
  );

CREATE POLICY site_settings_admin_insert ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'settings.manage'));

CREATE POLICY site_settings_admin_update ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'settings.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'settings.manage'));

CREATE POLICY site_settings_admin_delete ON public.site_settings
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'settings.manage'));

-- ---------------------------------------------------------------------------
-- RBAC admin
-- ---------------------------------------------------------------------------
CREATE POLICY roles_admin_select ON public.roles
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'roles.view')
    OR public.has_permission(auth.uid(), 'roles.manage')
  );

CREATE POLICY roles_admin_insert ON public.roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY roles_admin_update ON public.roles
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'roles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY roles_admin_delete ON public.roles
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY permissions_read ON public.permissions
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'roles.view')
    OR public.has_permission(auth.uid(), 'roles.manage')
  );

CREATE POLICY role_permissions_admin_select ON public.role_permissions
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'roles.view')
    OR public.has_permission(auth.uid(), 'roles.manage')
  );

CREATE POLICY role_permissions_admin_insert ON public.role_permissions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY role_permissions_admin_update ON public.role_permissions
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'roles.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY role_permissions_admin_delete ON public.role_permissions
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY user_roles_admin_select ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'users.view')
    OR public.has_permission(auth.uid(), 'users.manage')
  );

CREATE POLICY user_roles_admin_insert ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'users.manage'));

CREATE POLICY user_roles_admin_update ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'users.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'users.manage'));

CREATE POLICY user_roles_admin_delete ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'users.manage'));

-- Audit logs: SELECT only for authenticated; INSERT via service role (bypasses RLS)
CREATE POLICY audit_logs_admin_select ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'audit_logs.view')
    OR public.has_permission(auth.uid(), 'audit_logs.manage')
  );

-- ===========================================================================
-- Storage policies (command-separated INSERT/UPDATE vs DELETE)
-- ===========================================================================

-- Public assets: anyone can read
CREATE POLICY public_assets_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'public-assets');

CREATE POLICY public_assets_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'public-assets'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.update')
      OR public.has_permission(auth.uid(), 'media.manage')
      OR public.has_permission(auth.uid(), 'theme.manage')
    )
  );

CREATE POLICY public_assets_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.update')
      OR public.has_permission(auth.uid(), 'media.manage')
      OR public.has_permission(auth.uid(), 'theme.manage')
    )
  )
  WITH CHECK (
    bucket_id = 'public-assets'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.update')
      OR public.has_permission(auth.uid(), 'media.manage')
      OR public.has_permission(auth.uid(), 'theme.manage')
    )
  );

CREATE POLICY public_assets_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND (
      public.has_permission(auth.uid(), 'media.manage')
      OR public.has_permission(auth.uid(), 'theme.manage')
    )
  );

-- Private media bucket
CREATE POLICY media_bucket_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'media'
    AND (
      public.has_permission(auth.uid(), 'media.view')
      OR public.has_permission(auth.uid(), 'media.manage')
    )
  );

CREATE POLICY media_bucket_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.update')
      OR public.has_permission(auth.uid(), 'media.manage')
    )
  );

CREATE POLICY media_bucket_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'media'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.update')
      OR public.has_permission(auth.uid(), 'media.manage')
    )
  )
  WITH CHECK (
    bucket_id = 'media'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.update')
      OR public.has_permission(auth.uid(), 'media.manage')
    )
  );

CREATE POLICY media_bucket_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'media'
    AND public.has_permission(auth.uid(), 'media.manage')
  );
