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
  ('audit_logs.view', 'audit_logs', 'view', '{"ar":"عرض السجلات","en":"View audit logs"}'::JSONB)
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
