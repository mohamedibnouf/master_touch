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
  ('55555555-5555-5555-5555-555555555008', 'ar', 'لنبدأ مشروعك التالي', 'حلول موثوقة تلبي تطلعات عملائنا وتواكب متطلبات السوق ورؤية المملكة 2030.', 'تواصل معنا', '/contact'),
  ('55555555-5555-5555-5555-555555555008', 'en', 'Let us start your next project', 'Trusted solutions that meet client ambitions and keep pace with the market and Vision 2030.', 'Contact us', '/contact'),
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
