-- Phase 1.5 performance / integrity review

-- Composite indexes for common CMS queries
CREATE INDEX IF NOT EXISTS idx_homepage_sections_enabled_sort
  ON public.homepage_sections (is_enabled, sort_order)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_services_featured_published
  ON public.services (is_featured, is_published, sort_order)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_translations_ns_locale
  ON public.translations (namespace_id, locale);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created
  ON public.contact_messages (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_composite
  ON public.user_roles (user_id, role_id);

-- Ensure soft-deleted rows stay queryable via partial indexes already present

ANALYZE public.homepage_sections;
ANALYZE public.services;
ANALYZE public.translations;
ANALYZE public.contact_messages;
