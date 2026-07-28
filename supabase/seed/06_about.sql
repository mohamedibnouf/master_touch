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
