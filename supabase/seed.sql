-- =============================================================================
-- Master Touch — default seed entrypoint (AUTO-GENERATED)
-- Do not edit by hand. Regenerate: npm run db:seed:build
-- Sources: supabase/seed/01_*.sql … 09_*.sql (each included exactly once).
-- Registered in supabase/config.toml → [db.seed].sql_paths = ["./seed.sql"]
-- =============================================================================

-- >>> BEGIN seed/01_roles_permissions.sql
-- Seed: roles and permissions

INSERT INTO public.roles (id, slug, name_i18n, description_i18n, is_system, sort_order)
VALUES
  ('11111111-1111-1111-1111-111111111001', 'super_admin', '{"ar":"المدير العام","en":"Super Admin"}', '{"ar":"صلاحيات كاملة","en":"Full system access"}', TRUE, 1),
  ('11111111-1111-1111-1111-111111111002', 'administrator', '{"ar":"مسؤول","en":"Administrator"}', '{"ar":"إدارة النظام والمستخدمين","en":"System and user administration"}', TRUE, 2),
  ('11111111-1111-1111-1111-111111111003', 'content_manager', '{"ar":"مدير محتوى","en":"Content Manager"}', '{"ar":"إدارة المحتوى والنشر","en":"Content and publishing"}', TRUE, 3),
  ('11111111-1111-1111-1111-111111111004', 'marketing', '{"ar":"تسويق","en":"Marketing"}', '{"ar":"التسويق والتحديثات","en":"Marketing updates"}', TRUE, 4),
  ('11111111-1111-1111-1111-111111111005', 'hr', '{"ar":"موارد بشرية","en":"HR"}', '{"ar":"التوظيف والموارد البشرية","en":"Careers and HR"}', TRUE, 5),
  ('11111111-1111-1111-1111-111111111006', 'editor', '{"ar":"محرر","en":"Editor"}', '{"ar":"تحرير المحتوى","en":"Content editing"}', TRUE, 6),
  ('11111111-1111-1111-1111-111111111007', 'viewer', '{"ar":"مشاهد","en":"Viewer"}', '{"ar":"عرض فقط","en":"Read-only access"}', TRUE, 7)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.permissions (key, module, action, description_i18n)
SELECT * FROM (VALUES
  ('dashboard.view', 'dashboard', 'view', '{"ar":"عرض لوحة التحكم","en":"View dashboard"}'::JSONB),
  ('users.view', 'users', 'view', '{"ar":"عرض المستخدمين","en":"View users"}'::JSONB),
  ('users.manage', 'users', 'manage', '{"ar":"إدارة المستخدمين","en":"Manage users"}'::JSONB),
  ('roles.view', 'roles', 'view', '{"ar":"عرض الأدوار","en":"View roles"}'::JSONB),
  ('roles.manage', 'roles', 'manage', '{"ar":"إدارة الأدوار","en":"Manage roles"}'::JSONB),
  ('homepage.view', 'homepage', 'view', '{"ar":"عرض الصفحة الرئيسية","en":"View homepage CMS"}'::JSONB),
  ('homepage.update', 'homepage', 'update', '{"ar":"تحديث الصفحة الرئيسية","en":"Update homepage"}'::JSONB),
  ('homepage.manage', 'homepage', 'manage', '{"ar":"إدارة الصفحة الرئيسية","en":"Manage homepage"}'::JSONB),
  ('about.view', 'about', 'view', '{"ar":"عرض من نحن","en":"View about"}'::JSONB),
  ('about.update', 'about', 'update', '{"ar":"تحديث من نحن","en":"Update about"}'::JSONB),
  ('about.manage', 'about', 'manage', '{"ar":"إدارة من نحن","en":"Manage about"}'::JSONB),
  ('services.view', 'services', 'view', '{"ar":"عرض الخدمات","en":"View services"}'::JSONB),
  ('services.create', 'services', 'create', '{"ar":"إنشاء خدمة","en":"Create service"}'::JSONB),
  ('services.update', 'services', 'update', '{"ar":"تحديث خدمة","en":"Update service"}'::JSONB),
  ('services.delete', 'services', 'delete', '{"ar":"حذف خدمة","en":"Delete service"}'::JSONB),
  ('services.publish', 'services', 'publish', '{"ar":"نشر خدمة","en":"Publish service"}'::JSONB),
  ('services.manage', 'services', 'manage', '{"ar":"إدارة الخدمات","en":"Manage services"}'::JSONB),
  ('contact.view', 'contact', 'view', '{"ar":"عرض التواصل","en":"View contact"}'::JSONB),
  ('contact.update', 'contact', 'update', '{"ar":"تحديث التواصل","en":"Update contact"}'::JSONB),
  ('contact.manage', 'contact', 'manage', '{"ar":"إدارة التواصل","en":"Manage contact"}'::JSONB),
  ('contact_messages.view', 'contact_messages', 'view', '{"ar":"عرض الرسائل","en":"View messages"}'::JSONB),
  ('contact_messages.update', 'contact_messages', 'update', '{"ar":"تحديث الرسائل","en":"Update messages"}'::JSONB),
  ('contact_messages.manage', 'contact_messages', 'manage', '{"ar":"إدارة الرسائل","en":"Manage messages"}'::JSONB),
  ('media.view', 'media', 'view', '{"ar":"عرض الوسائط","en":"View media"}'::JSONB),
  ('media.create', 'media', 'create', '{"ar":"رفع وسائط","en":"Upload media"}'::JSONB),
  ('media.update', 'media', 'update', '{"ar":"تحديث وسائط","en":"Update media"}'::JSONB),
  ('media.delete', 'media', 'delete', '{"ar":"حذف وسائط","en":"Delete media"}'::JSONB),
  ('media.manage', 'media', 'manage', '{"ar":"إدارة الوسائط","en":"Manage media"}'::JSONB),
  ('theme.view', 'theme', 'view', '{"ar":"عرض الثيم","en":"View theme"}'::JSONB),
  ('theme.manage', 'theme', 'manage', '{"ar":"إدارة الثيم","en":"Manage theme"}'::JSONB),
  ('translations.view', 'translations', 'view', '{"ar":"عرض الترجمة","en":"View translations"}'::JSONB),
  ('translations.update', 'translations', 'update', '{"ar":"تحديث الترجمة","en":"Update translations"}'::JSONB),
  ('translations.manage', 'translations', 'manage', '{"ar":"إدارة الترجمة","en":"Manage translations"}'::JSONB),
  ('settings.view', 'settings', 'view', '{"ar":"عرض الإعدادات","en":"View settings"}'::JSONB),
  ('settings.manage', 'settings', 'manage', '{"ar":"إدارة الإعدادات","en":"Manage settings"}'::JSONB),
  ('audit_logs.view', 'audit_logs', 'view', '{"ar":"عرض السجلات","en":"View audit logs"}'::JSONB),
  ('audit_logs.manage', 'audit_logs', 'manage', '{"ar":"إدارة السجلات","en":"Manage audit logs"}'::JSONB)
) AS v(key, module, action, description_i18n)
ON CONFLICT (key) DO NOTHING;

-- Super admin gets everything via is_super_admin(); still attach all for matrix clarity
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'super_admin'
ON CONFLICT DO NOTHING;

-- Administrator: all except treated as manage-capable
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'administrator'
ON CONFLICT DO NOTHING;

-- Content manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN (
  'dashboard.view',
  'homepage.view','homepage.update','homepage.manage',
  'about.view','about.update','about.manage',
  'services.view','services.create','services.update','services.delete','services.publish','services.manage',
  'contact.view','contact.update',
  'contact_messages.view','contact_messages.update',
  'media.view','media.create','media.update','media.delete','media.manage',
  'translations.view','translations.update'
)
WHERE r.slug = 'content_manager'
ON CONFLICT DO NOTHING;

-- Marketing
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN (
  'dashboard.view',
  'homepage.view','homepage.update',
  'about.view','about.update',
  'services.view','services.update',
  'contact.view',
  'media.view','media.create','media.update'
)
WHERE r.slug = 'marketing'
ON CONFLICT DO NOTHING;

-- HR (Phase 1: limited)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN ('dashboard.view', 'media.create', 'media.view')
WHERE r.slug = 'hr'
ON CONFLICT DO NOTHING;

-- Editor
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN (
  'dashboard.view',
  'homepage.view','homepage.update',
  'about.view','about.update',
  'services.view','services.update',
  'contact.view',
  'contact_messages.view',
  'media.view','media.create','media.update'
)
WHERE r.slug = 'editor'
ON CONFLICT DO NOTHING;

-- Viewer
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key LIKE '%.view'
WHERE r.slug = 'viewer'
ON CONFLICT DO NOTHING;
-- <<< END seed/01_roles_permissions.sql

-- >>> BEGIN seed/02_super_admin.sql
-- After creating the first Auth user in Supabase Dashboard (or Auth API),
-- run this with that user's UUID to grant Super Admin.
--
-- Example:
--   SELECT public.assign_super_admin('00000000-0000-0000-0000-000000000000');

CREATE OR REPLACE FUNCTION public.assign_super_admin(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id UUID;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE slug = 'super_admin' AND deleted_at IS NULL;
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
-- <<< END seed/02_super_admin.sql

-- >>> BEGIN seed/03_theme_settings.sql
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
-- <<< END seed/03_theme_settings.sql

-- >>> BEGIN seed/04_translations.sql
INSERT INTO public.translation_namespaces (id, slug, name)
VALUES
  ('33333333-3333-3333-3333-333333333001', 'common', 'Common'),
  ('33333333-3333-3333-3333-333333333002', 'nav', 'Navigation'),
  ('33333333-3333-3333-3333-333333333003', 'admin', 'Admin'),
  ('33333333-3333-3333-3333-333333333004', 'auth', 'Authentication'),
  ('33333333-3333-3333-3333-333333333005', 'footer', 'Footer')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.translations (namespace_id, key, locale, value)
SELECT n.id, t.key, t.locale::public.app_locale, t.value
FROM public.translation_namespaces n
JOIN (VALUES
  ('common', 'brand', 'ar', 'ماستر تاتش'),
  ('common', 'brand', 'en', 'Master Touch'),
  ('common', 'learn_more', 'ar', 'اعرف المزيد'),
  ('common', 'learn_more', 'en', 'Learn more'),
  ('common', 'contact_us', 'ar', 'تواصل معنا'),
  ('common', 'contact_us', 'en', 'Contact us'),
  ('common', 'view_services', 'ar', 'استعرض خدماتنا'),
  ('common', 'view_services', 'en', 'View our services'),
  ('common', 'loading', 'ar', 'جاري التحميل...'),
  ('common', 'loading', 'en', 'Loading...'),
  ('nav', 'home', 'ar', 'الرئيسية'),
  ('nav', 'home', 'en', 'Home'),
  ('nav', 'about', 'ar', 'من نحن'),
  ('nav', 'about', 'en', 'About'),
  ('nav', 'services', 'ar', 'خدماتنا'),
  ('nav', 'services', 'en', 'Services'),
  ('nav', 'contact', 'ar', 'تواصل معنا'),
  ('nav', 'contact', 'en', 'Contact'),
  ('footer', 'rights', 'ar', 'جميع الحقوق محفوظة.'),
  ('footer', 'rights', 'en', 'All rights reserved.'),
  ('footer', 'tagline', 'ar', 'اللمسة الأخيرة نحو التميز والتقنية'),
  ('footer', 'tagline', 'en', 'The final touch toward excellence and technology'),
  ('auth', 'login', 'ar', 'تسجيل الدخول'),
  ('auth', 'login', 'en', 'Sign in'),
  ('auth', 'email', 'ar', 'البريد الإلكتروني'),
  ('auth', 'email', 'en', 'Email'),
  ('auth', 'password', 'ar', 'كلمة المرور'),
  ('auth', 'password', 'en', 'Password'),
  ('auth', 'forgot_password', 'ar', 'نسيت كلمة المرور؟'),
  ('auth', 'forgot_password', 'en', 'Forgot password?'),
  ('auth', 'remember_me', 'ar', 'تذكرني'),
  ('auth', 'remember_me', 'en', 'Remember me'),
  ('auth', 'reset_password', 'ar', 'إعادة تعيين كلمة المرور'),
  ('auth', 'reset_password', 'en', 'Reset password'),
  ('admin', 'dashboard', 'ar', 'لوحة التحكم'),
  ('admin', 'dashboard', 'en', 'Dashboard'),
  ('admin', 'users', 'ar', 'المستخدمون'),
  ('admin', 'users', 'en', 'Users'),
  ('admin', 'roles', 'ar', 'الأدوار'),
  ('admin', 'roles', 'en', 'Roles'),
  ('admin', 'homepage', 'ar', 'الصفحة الرئيسية'),
  ('admin', 'homepage', 'en', 'Homepage'),
  ('admin', 'about', 'ar', 'من نحن'),
  ('admin', 'about', 'en', 'About'),
  ('admin', 'services', 'ar', 'الخدمات'),
  ('admin', 'services', 'en', 'Services'),
  ('admin', 'contact', 'ar', 'التواصل'),
  ('admin', 'contact', 'en', 'Contact'),
  ('admin', 'media', 'ar', 'مكتبة الوسائط'),
  ('admin', 'media', 'en', 'Media Library'),
  ('admin', 'theme', 'ar', 'مدير الثيم'),
  ('admin', 'theme', 'en', 'Theme Manager'),
  ('admin', 'translations', 'ar', 'مدير الترجمة'),
  ('admin', 'translations', 'en', 'Translation Manager'),
  ('admin', 'settings', 'ar', 'الإعدادات'),
  ('admin', 'settings', 'en', 'Settings'),
  ('admin', 'profile', 'ar', 'الملف الشخصي'),
  ('admin', 'profile', 'en', 'Profile'),
  ('admin', 'logout', 'ar', 'تسجيل الخروج'),
  ('admin', 'logout', 'en', 'Sign out'),
  ('admin', 'save', 'ar', 'حفظ'),
  ('admin', 'save', 'en', 'Save'),
  ('admin', 'cancel', 'ar', 'إلغاء'),
  ('admin', 'cancel', 'en', 'Cancel')
) AS t(ns, key, locale, value) ON n.slug = t.ns
ON CONFLICT (namespace_id, key, locale) DO UPDATE SET value = EXCLUDED.value;
-- <<< END seed/04_translations.sql

-- >>> BEGIN seed/05_homepage_sections.sql
-- Homepage page + sections seeded from Master Touch Profile 2026

INSERT INTO public.pages (id, slug, page_type, is_published, sort_order)
VALUES ('44444444-4444-4444-4444-444444444001', 'home', 'home', TRUE, 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.page_translations (page_id, locale, title, excerpt)
VALUES
  ('44444444-4444-4444-4444-444444444001', 'ar', 'الرئيسية', 'ماستر تاتش — أعمال متكاملة في المملكة'),
  ('44444444-4444-4444-4444-444444444001', 'en', 'Home', 'Master Touch — integrated works across the Kingdom')
ON CONFLICT (page_id, locale) DO NOTHING;

INSERT INTO public.homepage_sections (id, page_id, key, sort_order, is_enabled, settings)
VALUES
  ('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', 'hero', 1, TRUE, '{"autoplay":true,"interval_ms":6000}'::JSONB),
  ('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444001', 'about', 2, TRUE, '{}'::JSONB),
  ('55555555-5555-5555-5555-555555555003', '44444444-4444-4444-4444-444444444001', 'stats', 3, TRUE, '{}'::JSONB),
  ('55555555-5555-5555-5555-555555555004', '44444444-4444-4444-4444-444444444001', 'vision', 4, TRUE, '{}'::JSONB),
  ('55555555-5555-5555-5555-555555555005', '44444444-4444-4444-4444-444444444001', 'mission', 5, TRUE, '{}'::JSONB),
  ('55555555-5555-5555-5555-555555555006', '44444444-4444-4444-4444-444444444001', 'values', 6, TRUE, '{}'::JSONB),
  ('55555555-5555-5555-5555-555555555007', '44444444-4444-4444-4444-444444444001', 'services', 7, TRUE, '{}'::JSONB),
  ('55555555-5555-5555-5555-555555555008', '44444444-4444-4444-4444-444444444001', 'cta', 8, TRUE, '{}'::JSONB),
  ('55555555-5555-5555-5555-555555555009', '44444444-4444-4444-4444-444444444001', 'contact_map', 9, TRUE, '{}'::JSONB)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.homepage_section_translations (section_id, locale, title, subtitle, body, cta_label, cta_href)
VALUES
  ('55555555-5555-5555-5555-555555555001', 'ar', 'ماستر تاتش', 'اللمسة الأخيرة نحو التميز والتقنية', 'شركة سعودية متخصصة في التشطيبات المتكاملة والأعمال الكهروميكانيكية والأنظمة التقنية الذكية.', 'تواصل معنا', '/contact'),
  ('55555555-5555-5555-5555-555555555001', 'en', 'Master Touch', 'The final touch toward excellence and technology', 'A Saudi company specialized in integrated finishing, electromechanical works, and smart technical systems.', 'Contact us', '/contact'),
  ('55555555-5555-5555-5555-555555555002', 'ar', 'نبذة عن الشركة', 'خبرة وابتكار في تنفيذ مشاريعنا', 'نقدم خدمات شاملة تبدأ من التصميم والتنفيذ وحتى التشغيل والصيانة، وفق أعلى معايير الجودة والسلامة والاحترافية، بما يتماشى مع رؤية المملكة العربية السعودية 2030.', 'من نحن', '/about'),
  ('55555555-5555-5555-5555-555555555002', 'en', 'About the company', 'Experience and innovation in project delivery', 'We deliver end-to-end services from design and execution through operation and maintenance, aligned with the highest standards of quality, safety, and professionalism — supporting Saudi Vision 2030.', 'About us', '/about'),
  ('55555555-5555-5555-5555-555555555003', 'ar', 'مؤشرات الأداء', 'إنجاز يُقاس بالأرقام', NULL, NULL, NULL),
  ('55555555-5555-5555-5555-555555555003', 'en', 'Performance indicators', 'Results measured in numbers', NULL, NULL, NULL),
  ('55555555-5555-5555-5555-555555555004', 'ar', 'رؤيتنا', NULL, 'أن نكون الخيار الأول والرائد في مجال أعمال الكهروميكانيك والتشطيبات المعمارية والحلول التقنية الذكية في المملكة العربية السعودية، من خلال تقديم حلول مبتكرة تجمع بين الجودة والاحترافية والاستدامة والتقنية المتطورة بما يتوافق مع رؤية المملكة 2030.', NULL, NULL),
  ('55555555-5555-5555-5555-555555555004', 'en', 'Our vision', NULL, 'To be the first and leading choice in electromechanical works, architectural finishing, and smart technical solutions in the Kingdom of Saudi Arabia — delivering innovative solutions that unite quality, professionalism, sustainability, and advanced technology in line with Vision 2030.', NULL, NULL),
  ('55555555-5555-5555-5555-555555555005', 'ar', 'رسالتنا', NULL, 'نسعى لتقديم خدمات هندسية وتقنية متكاملة تعتمد على الجودة العالية والإبداع والدقة في التنفيذ، لتحقيق رضا عملائنا وبناء شراكات طويلة الأمد تقوم على الثقة والتميز والابتكار التقني.', NULL, NULL),
  ('55555555-5555-5555-5555-555555555005', 'en', 'Our mission', NULL, 'We strive to provide integrated engineering and technical services grounded in high quality, creativity, and precision — achieving client satisfaction and building long-term partnerships based on trust, excellence, and technical innovation.', NULL, NULL),
  ('55555555-5555-5555-5555-555555555006', 'ar', 'قيمنا', 'ما نلتزم به في كل تفاصيل العمل', NULL, NULL, NULL),
  ('55555555-5555-5555-5555-555555555006', 'en', 'Our values', 'What we uphold in every detail of our work', NULL, NULL, NULL),
  ('55555555-5555-5555-5555-555555555007', 'ar', 'خدماتنا', 'حلول متكاملة عبر قطاعات متعددة', NULL, 'كل الخدمات', '/services'),
  ('55555555-5555-5555-5555-555555555007', 'en', 'Our services', 'Integrated solutions across multiple sectors', NULL, 'All services', '/services'),
  ('55555555-5555-5555-5555-555555555008', 'ar', 'لنبدأ مشروعك التالي', 'حلول موثوقة تلبي تطلعات عملائنا وتواكب متطلبات السوق ورؤية المملكة 2030.', NULL, 'تواصل معنا', '/contact'),
  ('55555555-5555-5555-5555-555555555008', 'en', 'Let us start your next project', 'Trusted solutions that meet client ambitions and keep pace with the market and Vision 2030.', NULL, 'Contact us', '/contact'),
  ('55555555-5555-5555-5555-555555555009', 'ar', 'موقعنا', 'الرياض، المملكة العربية السعودية', NULL, NULL, NULL),
  ('55555555-5555-5555-5555-555555555009', 'en', 'Our location', 'Riyadh, Kingdom of Saudi Arabia', NULL, NULL, NULL)
ON CONFLICT (section_id, locale) DO NOTHING;

INSERT INTO public.homepage_slides (id, section_id, media_url, sort_order, is_enabled, link_url)
VALUES
  ('66666666-6666-6666-6666-666666666001', '55555555-5555-5555-5555-555555555001', '/images/placeholders/hero-1.svg', 1, TRUE, '/services'),
  ('66666666-6666-6666-6666-666666666002', '55555555-5555-5555-5555-555555555001', '/images/placeholders/hero-2.svg', 2, TRUE, '/about'),
  ('66666666-6666-6666-6666-666666666003', '55555555-5555-5555-5555-555555555001', '/images/placeholders/hero-3.svg', 3, TRUE, '/contact')
ON CONFLICT DO NOTHING;

INSERT INTO public.homepage_slide_translations (slide_id, locale, title, subtitle, cta_label)
VALUES
  ('66666666-6666-6666-6666-666666666001', 'ar', 'أعمال كهروميكانيكية متكاملة', 'كهرباء وميكانيكا وفق أعلى المعايير', 'استكشف الخدمات'),
  ('66666666-6666-6666-6666-666666666001', 'en', 'Integrated electromechanical works', 'Electrical and mechanical excellence', 'Explore services'),
  ('66666666-6666-6666-6666-666666666002', 'ar', 'تشطيبات معمارية راقية', 'نحوّل المساحات إلى لوحات فنية متكاملة', 'تعرف علينا'),
  ('66666666-6666-6666-6666-666666666002', 'en', 'Premium architectural finishing', 'Transforming spaces into integrated art', 'About us'),
  ('66666666-6666-6666-6666-666666666003', 'ar', 'حلول تقنية وأنظمة ذكية', 'أمن، شبكات، وأتمتة منزلية ومؤسسية', 'تواصل معنا'),
  ('66666666-6666-6666-6666-666666666003', 'en', 'Smart systems and IT solutions', 'Security, networks, and automation', 'Contact us')
ON CONFLICT (slide_id, locale) DO NOTHING;
-- <<< END seed/05_homepage_sections.sql

-- >>> BEGIN seed/06_about.sql
INSERT INTO public.about_pages (id, cover_image_url, is_published)
VALUES ('77777777-7777-7777-7777-777777777001', '/images/placeholders/about-cover.svg', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.about_translations (
  about_id, locale, history, vision, mission, objectives, ceo_message, ceo_name, ceo_title
)
VALUES
(
  '77777777-7777-7777-7777-777777777001',
  'ar',
  'تُعد ماستر تاتش إحدى الشركات المتخصصة في تقديم أعمال الكهروميكانيك والتشطيبات المعمارية والأنظمة التقنية المتكاملة في المملكة العربية السعودية. نعتمد على الخبرة والجودة والابتكار في تنفيذ مشاريعنا، ونلتزم بتقديم حلول موثوقة تلبي تطلعات عملائنا وتواكب متطلبات السوق ورؤية المملكة 2030.',
  'أن نكون الخيار الأول والرائد في مجال أعمال الكهروميكانيك والتشطيبات المعمارية والحلول التقنية الذكية في المملكة العربية السعودية، من خلال تقديم حلول مبتكرة تجمع بين الجودة والاحترافية والاستدامة والتقنية المتطورة بما يتوافق مع رؤية المملكة 2030.',
  'نسعى لتقديم خدمات هندسية وتقنية متكاملة تعتمد على الجودة العالية والإبداع والدقة في التنفيذ، لتحقيق رضا عملائنا وبناء شراكات طويلة الأمد تقوم على الثقة والتميز والابتكار التقني.',
  'نطمح إلى توسيع حضورنا في السوق السعودي والعالمي، وتعزيز شراكاتنا الاستراتيجية مع العملاء والمستثمرين، مع التركيز على الابتكار المستمر والاستدامة في المشاريع بما يدعم رؤية المملكة 2030.',
  'في ماستر تاتش نسعى لأن نكون الخيار الأول والرائد في مجال التشطيبات والأعمال الكهروميكانيكية والحلول التقنية الذكية، من خلال تقديم حلول مبتكرة تجمع بين الجودة والاحترافية والتقنية المتقدمة.',
  'م. محمد الصادق',
  'الرئيس التنفيذي'
),
(
  '77777777-7777-7777-7777-777777777001',
  'en',
  'Master Touch is a specialized Saudi company delivering electromechanical works, architectural finishing, and integrated technical systems across the Kingdom. We rely on experience, quality, and innovation — providing trusted solutions that meet client ambitions and align with market needs and Vision 2030.',
  'To be the first and leading choice in electromechanical works, architectural finishing, and smart technical solutions in Saudi Arabia, delivering innovative solutions that unite quality, professionalism, sustainability, and advanced technology in line with Vision 2030.',
  'We strive to provide integrated engineering and technical services grounded in high quality, creativity, and precision — achieving client satisfaction and building long-term partnerships based on trust, excellence, and technical innovation.',
  'We aspire to expand our presence in the Saudi and global markets, strengthen strategic partnerships with clients and investors, and focus on continuous innovation and sustainability in projects that support Vision 2030.',
  'At Master Touch we strive to be the first and leading choice in finishing, electromechanical works, and smart technical solutions — delivering innovative solutions that combine quality, professionalism, and advanced technology.',
  'Eng. Mohammed Elsadig',
  'Chief Executive Officer'
)
ON CONFLICT (about_id, locale) DO NOTHING;

INSERT INTO public.about_values (id, about_id, icon, sort_order, is_enabled)
VALUES
  ('88888888-8888-8888-8888-888888888001', '77777777-7777-7777-7777-777777777001', 'Award', 1, TRUE),
  ('88888888-8888-8888-8888-888888888002', '77777777-7777-7777-7777-777777777001', 'Clock', 2, TRUE),
  ('88888888-8888-8888-8888-888888888003', '77777777-7777-7777-7777-777777777001', 'ShieldCheck', 3, TRUE),
  ('88888888-8888-8888-8888-888888888004', '77777777-7777-7777-7777-777777777001', 'Sparkles', 4, TRUE),
  ('88888888-8888-8888-8888-888888888005', '77777777-7777-7777-7777-777777777001', 'HardHat', 5, TRUE),
  ('88888888-8888-8888-8888-888888888006', '77777777-7777-7777-7777-777777777001', 'Headset', 6, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.about_value_translations (value_id, locale, title, description)
VALUES
  ('88888888-8888-8888-8888-888888888001', 'ar', 'الجودة والتميز', 'في كل تفاصيل العمل'),
  ('88888888-8888-8888-8888-888888888001', 'en', 'Quality and excellence', 'In every detail of the work'),
  ('88888888-8888-8888-8888-888888888002', 'ar', 'الالتزام بالمواعيد', 'والمعايير الهندسية والعالمية'),
  ('88888888-8888-8888-8888-888888888002', 'en', 'Commitment to deadlines', 'And engineering and global standards'),
  ('88888888-8888-8888-8888-888888888003', 'ar', 'النزاهة والشفافية', 'في التعامل مع العملاء والشركاء'),
  ('88888888-8888-8888-8888-888888888003', 'en', 'Integrity and transparency', 'In dealing with clients and partners'),
  ('88888888-8888-8888-8888-888888888004', 'ar', 'الابتكار المستمر', 'وتطوير الكفاءات والتقنيات'),
  ('88888888-8888-8888-8888-888888888004', 'en', 'Continuous innovation', 'Developing talent and technologies'),
  ('88888888-8888-8888-8888-888888888005', 'ar', 'السلامة أولاً', 'في كل مشروع ومنشأة'),
  ('88888888-8888-8888-8888-888888888005', 'en', 'Safety first', 'On every project and facility'),
  ('88888888-8888-8888-8888-888888888006', 'ar', 'الدعم التقني المتكامل', 'لضمان استمرارية وكفاءة الأنظمة'),
  ('88888888-8888-8888-8888-888888888006', 'en', 'Integrated technical support', 'Ensuring system continuity and efficiency')
ON CONFLICT (value_id, locale) DO NOTHING;

INSERT INTO public.about_stats (id, about_id, icon, value, sort_order, is_enabled)
VALUES
  ('99999999-9999-9999-9999-999999999001', '77777777-7777-7777-7777-777777777001', 'CheckCircle2', '98%', 1, TRUE),
  ('99999999-9999-9999-9999-999999999002', '77777777-7777-7777-7777-777777777001', 'Smile', '96%', 2, TRUE),
  ('99999999-9999-9999-9999-999999999003', '77777777-7777-7777-7777-777777777001', 'TrendingUp', '82%', 3, TRUE),
  ('99999999-9999-9999-9999-999999999004', '77777777-7777-7777-7777-777777777001', 'Target', '92%', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.about_stat_translations (stat_id, locale, label)
VALUES
  ('99999999-9999-9999-9999-999999999001', 'ar', 'نسبة إنجاز المشاريع في الوقت المحدد'),
  ('99999999-9999-9999-9999-999999999001', 'en', 'Projects completed on time'),
  ('99999999-9999-9999-9999-999999999002', 'ar', 'رضا العملاء'),
  ('99999999-9999-9999-9999-999999999002', 'en', 'Client satisfaction'),
  ('99999999-9999-9999-9999-999999999003', 'ar', 'نمو سنوي متصاعد'),
  ('99999999-9999-9999-9999-999999999003', 'en', 'Rising annual growth'),
  ('99999999-9999-9999-9999-999999999004', 'ar', 'اعتماد متوازن على أدوات الذكاء الاصطناعي وإنترنت الأشياء'),
  ('99999999-9999-9999-9999-999999999004', 'en', 'Balanced adoption of AI and IoT tools')
ON CONFLICT (stat_id, locale) DO NOTHING;

INSERT INTO public.about_timeline_items (id, about_id, event_year, sort_order, is_enabled)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', '77777777-7777-7777-7777-777777777001', '2020', 1, TRUE),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', '77777777-7777-7777-7777-777777777001', '2023', 2, TRUE),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', '77777777-7777-7777-7777-777777777001', '2026', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.about_timeline_translations (timeline_id, locale, title, description)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'ar', 'التأسيس والتخصص', 'الانطلاق كشركة سعودية متخصصة في الحلول المتكاملة'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'en', 'Foundation and focus', 'Launching as a Saudi company specialized in integrated solutions'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'ar', 'توسيع القدرات التقنية', 'تعزيز حلول الأنظمة الذكية وتقنية المعلومات'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'en', 'Expanding technical capability', 'Strengthening smart systems and IT solutions'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'ar', 'ملف الشركة 2026', 'مواصلة النمو بما يتماشى مع رؤية المملكة 2030'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'en', 'Company profile 2026', 'Continued growth aligned with Vision 2030')
ON CONFLICT (timeline_id, locale) DO NOTHING;
-- <<< END seed/06_about.sql

-- >>> BEGIN seed/07_services.sql
INSERT INTO public.services (id, slug, icon, cover_image_url, is_featured, is_published, sort_order, status)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'electromechanical', 'Zap', '/images/placeholders/service-mep.svg', TRUE, TRUE, 1, 'published'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'architectural-finishing', 'Paintbrush', '/images/placeholders/service-finishing.svg', TRUE, TRUE, 2, 'published'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'smart-it-solutions', 'Cpu', '/images/placeholders/service-smart.svg', TRUE, TRUE, 3, 'published'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'maintenance-operation', 'Wrench', '/images/placeholders/service-ops.svg', TRUE, TRUE, 4, 'published')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.service_translations (service_id, locale, title, summary, description, seo_title, seo_description)
VALUES
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'ar',
  'الأعمال الكهروميكانيكية',
  'حلول متكاملة للكهرباء والميكانيكا (MEP)',
  'نقدّم حلولاً متكاملة تشمل الأعمال الكهربائية: التمديدات الداخلية والشبكات الكهربائية، أنظمة التيار الخفيف (شبكات بيانات، صوتيات، أنظمة الطوارئ)، وإضاءة واجهات بتقنية DMX للمباني التجارية والفنادق. والأعمال الميكانيكية: أعمال السباكة وشبكات المياه والصرف الصحي، أنظمة التكييف المركزي والسبليت والتهوية المتقدمة، وأنظمة مكافحة الحريق (إطفاء وإنذار) وفق معايير الدفاع المدني.',
  'الأعمال الكهروميكانيكية | ماستر تاتش',
  'خدمات MEP متكاملة للكهرباء والميكانيكا في المملكة العربية السعودية'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'en',
  'Electromechanical Works',
  'Integrated electrical and mechanical (MEP) solutions',
  'We deliver integrated solutions covering electrical works: internal wiring and power networks, low-current systems (data, audio, emergency), and DMX facade lighting for commercial buildings and hotels. Mechanical works include plumbing and water/drainage networks, central HVAC, split systems and advanced ventilation, and firefighting systems (suppression and alarm) per civil defense standards.',
  'Electromechanical Works | Master Touch',
  'Integrated MEP electrical and mechanical services in Saudi Arabia'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'ar',
  'التشطيبات المعمارية',
  'نحوّل المساحات إلى لوحات فنية متكاملة',
  'تشمل خدماتنا أعمال الجبس (أسقف معلقة، زخارف، كرانيش)، أعمال الدهانات الداخلية والخارجية بأجود المواد، تركيب البلاط والسيراميك والبورسلين، الديكورات الخشبية والجبسية، أعمال الألمنيوم والزجاج (نوافذ، أبواب، واجهات)، أعمال اللياسة الداخلية والخارجية، والترميمات.',
  'التشطيبات المعمارية | ماستر تاتش',
  'تشطيبات معمارية متكاملة للمساحات السكنية والتجارية'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'en',
  'Architectural Finishing',
  'Transforming spaces into integrated works of art',
  'Our finishing services include gypsum works (suspended ceilings, ornaments, cornices), interior and exterior painting with premium materials, tile, ceramic and porcelain installation, wood and gypsum décor, aluminum and glass works (windows, doors, facades), interior and exterior plastering, and renovations.',
  'Architectural Finishing | Master Touch',
  'Integrated architectural finishing for residential and commercial spaces'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'ar',
  'الحلول التقنية والأنظمة الذكية',
  'أمن، شبكات، بنية تحتية تقنية وأتمتة',
  'نقدم الحلول التقنية المتكاملة في مجالات أنظمة الأمن وتقنية المعلومات، بما يشمل أنظمة المراقبة والكاميرات، السيرفرات وأنظمة الحوسبة، أنظمة البصمة والتحكم في الدخول، شبكات الحاسوب السلكية واللاسلكية، بناء بنية تحتية تقنية متكاملة للمؤسسات، وحلول المنازل الذكية (إضاءة ذكية، تحكم في المناخ، أنظمة صوتية، وأمان).',
  'الحلول التقنية والأنظمة الذكية | ماستر تاتش',
  'حلول IT وأنظمة ذكية موثوقة للشركات والمؤسسات'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'en',
  'Smart Systems & IT Solutions',
  'Security, networks, IT infrastructure and automation',
  'We provide integrated technical solutions across security systems and IT — including CCTV and monitoring, servers and computing, biometric and access control, wired and wireless networks, institutional IT infrastructure, and smart home solutions (smart lighting, climate control, audio, and security).',
  'Smart Systems & IT Solutions | Master Touch',
  'Trusted IT and smart systems for companies and institutions'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'ar',
  'أعمال الصيانة والتشغيل المتكاملة',
  'نضمن استمرارية وكفاءة المنشآت',
  'نضمن استمرارية وكفاءة المنشآت من خلال الصيانة الدورية والوقائية للكهرباء والتكييف والسباكة والأنظمة التقنية، إدارة وتشغيل المرافق (المباني، المصاعد، الأنظمة العامة والتقنية)، خدمات النظافة المهنية للمنشآت السكنية والتجارية، والدعم الفني والصيانة لأنظمة المراقبة والشبكات والسيرفرات.',
  'الصيانة والتشغيل | ماستر تاتش',
  'صيانة وتشغيل متكامل للمنشآت السكنية والتجارية'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'en',
  'Integrated Maintenance & Operation',
  'Ensuring facility continuity and efficiency',
  'We ensure facility continuity and efficiency through preventive and routine maintenance for electrical, HVAC, plumbing and technical systems; facility management and operation (buildings, elevators, general and technical systems); professional cleaning for residential and commercial facilities; and technical support for monitoring systems, networks, and servers.',
  'Maintenance & Operation | Master Touch',
  'Integrated maintenance and operation for residential and commercial facilities'
)
ON CONFLICT (service_id, locale) DO NOTHING;

INSERT INTO public.service_relations (service_id, related_service_id, sort_order)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 1)
ON CONFLICT DO NOTHING;
-- <<< END seed/07_services.sql

-- >>> BEGIN seed/08_contact.sql
INSERT INTO public.contact_settings (id, map_embed_url, working_hours_json, is_form_enabled, notify_email)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.0!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1700000000000',
  '{"ar":{"sunday_thursday":"8:00 ص – 5:00 م","friday":"مغلق","saturday":"حسب الموعد"},"en":{"sunday_thursday":"8:00 AM – 5:00 PM","friday":"Closed","saturday":"By appointment"}}'::JSONB,
  TRUE,
  'info@mastertouchksa.com'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contact_setting_translations (settings_id, locale, headline, intro, form_success_message)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'ar', 'تواصل معنا', 'يسعدنا استقبال استفساراتكم ومشاريعكم القادمة.', 'تم إرسال رسالتكم بنجاح. سنتواصل معكم قريباً.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'en', 'Contact us', 'We welcome your inquiries and upcoming projects.', 'Your message was sent successfully. We will get back to you soon.')
ON CONFLICT (settings_id, locale) DO NOTHING;

INSERT INTO public.contact_branches (id, settings_id, latitude, longitude, sort_order, is_primary, is_enabled)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccc02',
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  24.7136000,
  46.6753000,
  1,
  TRUE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contact_branch_translations (branch_id, locale, name, address, city, country)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'ar', 'المقر الرئيسي', 'الرياض', 'الرياض', 'المملكة العربية السعودية'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'en', 'Head Office', 'Riyadh', 'Riyadh', 'Kingdom of Saudi Arabia')
ON CONFLICT (branch_id, locale) DO NOTHING;

INSERT INTO public.contact_channels (id, settings_id, branch_id, channel_type, value, label, sort_order, is_primary, is_enabled)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc11', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccc02', 'email', 'info@mastertouchksa.com', 'Email', 1, TRUE, TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccc12', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccc02', 'phone', '+966-50-683-4610', 'Phone', 2, TRUE, TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccc13', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccc02', 'whatsapp', '+966506834610', 'WhatsApp', 3, FALSE, TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccc14', 'cccccccc-cccc-cccc-cccc-cccccccccc01', NULL, 'other', 'www.mastertouchksa.com', 'Website', 4, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;
-- <<< END seed/08_contact.sql

-- >>> BEGIN seed/09_seo_defaults.sql
INSERT INTO public.pages (id, slug, page_type, is_published, sort_order)
VALUES
  ('44444444-4444-4444-4444-444444444002', 'about', 'about', TRUE, 2),
  ('44444444-4444-4444-4444-444444444003', 'services', 'services', TRUE, 3),
  ('44444444-4444-4444-4444-444444444004', 'contact', 'contact', TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.page_translations (page_id, locale, title, excerpt)
VALUES
  ('44444444-4444-4444-4444-444444444002', 'ar', 'من نحن', 'تعرف على ماستر تاتش'),
  ('44444444-4444-4444-4444-444444444002', 'en', 'About Us', 'Learn about Master Touch'),
  ('44444444-4444-4444-4444-444444444003', 'ar', 'خدماتنا', 'حلول متكاملة عبر قطاعات متعددة'),
  ('44444444-4444-4444-4444-444444444003', 'en', 'Our Services', 'Integrated solutions across sectors'),
  ('44444444-4444-4444-4444-444444444004', 'ar', 'تواصل معنا', 'الرياض، المملكة العربية السعودية'),
  ('44444444-4444-4444-4444-444444444004', 'en', 'Contact Us', 'Riyadh, Kingdom of Saudi Arabia')
ON CONFLICT (page_id, locale) DO NOTHING;

INSERT INTO public.page_seo (page_id, locale, meta_title, meta_description, meta_keywords, robots)
VALUES
  ('44444444-4444-4444-4444-444444444001', 'ar', 'ماستر تاتش | أعمال كهروميكانيكية وتشطيبات وأنظمة ذكية', 'شركة سعودية متخصصة في التشطيبات المتكاملة والأعمال الكهروميكانيكية والأنظمة التقنية الذكية في الرياض.', 'ماستر تاتش, كهروميكانيك, تشطيبات, أنظمة ذكية, الرياض', 'index,follow'),
  ('44444444-4444-4444-4444-444444444001', 'en', 'Master Touch | Electromechanical, Finishing & Smart Solutions', 'Saudi company specialized in integrated finishing, electromechanical works, and smart technical systems in Riyadh.', 'Master Touch, MEP, finishing, smart systems, Riyadh', 'index,follow'),
  ('44444444-4444-4444-4444-444444444002', 'ar', 'من نحن | ماستر تاتش', 'رؤية ورسالة وقيم وإنجازات ماستر تاتش.', 'من نحن, ماستر تاتش, رؤية 2030', 'index,follow'),
  ('44444444-4444-4444-4444-444444444002', 'en', 'About Us | Master Touch', 'Vision, mission, values, and achievements of Master Touch.', 'about, Master Touch, Vision 2030', 'index,follow'),
  ('44444444-4444-4444-4444-444444444003', 'ar', 'خدماتنا | ماستر تاتش', 'كهروميكانيك، تشطيبات معمارية، حلول تقنية، وصيانة وتشغيل.', 'خدمات, MEP, تشطيبات', 'index,follow'),
  ('44444444-4444-4444-4444-444444444003', 'en', 'Services | Master Touch', 'Electromechanical, architectural finishing, smart IT, and O&M.', 'services, MEP, finishing', 'index,follow'),
  ('44444444-4444-4444-4444-444444444004', 'ar', 'تواصل معنا | ماستر تاتش', 'info@mastertouchksa.com | +966-50-683-4610 | الرياض', 'تواصل, ماستر تاتش', 'index,follow'),
  ('44444444-4444-4444-4444-444444444004', 'en', 'Contact | Master Touch', 'info@mastertouchksa.com | +966-50-683-4610 | Riyadh', 'contact, Master Touch', 'index,follow')
ON CONFLICT (page_id, locale) DO NOTHING;
-- <<< END seed/09_seo_defaults.sql

