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
