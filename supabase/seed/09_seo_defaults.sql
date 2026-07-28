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
