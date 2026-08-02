import type {
  AboutContent,
  AppLocale,
  ContactContent,
  HomepageSection,
  PageSeo,
  ServiceItem,
  SiteSettings,
  ThemeSettings,
} from "@/types/cms";

/** Static seed mirror for local preview when Supabase env is not configured. */
export const previewThemeSettings: ThemeSettings = {
  id: "22222222-2222-2222-2222-222222222001",
  primary_color: "#0B1F3A",
  secondary_color: "#132F54",
  accent_color: "#E87722",
  background_color: "#FFFFFF",
  foreground_color: "#0F172A",
  font_sans: "Manrope",
  font_display: "Cormorant Garamond",
  border_radius: "0.75rem",
  button_style: {},
  card_style: {},
  animation_settings: {},
  dark_mode_enabled: true,
  logo_light_url: null,
  logo_dark_url: null,
  favicon_url: null,
  loader_url: null,
  custom_css: null,
};

export const previewSiteSettings: SiteSettings = {
  id: "22222222-2222-2222-2222-222222222002",
  site_name_i18n: { ar: "ماستر تاتش", en: "Master Touch" },
  tagline_i18n: {
    ar: "اللمسة الأخيرة نحو التميز والتقنية",
    en: "The final touch toward excellence and technology",
  },
  default_locale: "ar",
  website_url: "https://www.mastertouchksa.com",
  social_links: {},
  header_settings: {},
  footer_settings: {},
  maintenance_mode: false,
};

const sectionCopy: Record<
  string,
  Record<AppLocale, { title: string | null; subtitle: string | null; body: string | null; cta_label: string | null; cta_href: string | null }>
> = {
  hero: {
    ar: {
      title: "ماستر تاتش",
      subtitle: "اللمسة الأخيرة نحو التميز والتقنية",
      body: "شركة سعودية متخصصة في التشطيبات المتكاملة والأعمال الكهروميكانيكية والأنظمة التقنية الذكية.",
      cta_label: "تواصل معنا",
      cta_href: "/contact",
    },
    en: {
      title: "Master Touch",
      subtitle: "The final touch toward excellence and technology",
      body: "A Saudi company specialized in integrated finishing, electromechanical works, and smart technical systems.",
      cta_label: "Contact us",
      cta_href: "/contact",
    },
  },
  about: {
    ar: {
      title: "نبذة عن الشركة",
      subtitle: "خبرة وابتكار في تنفيذ مشاريعنا",
      body: "نقدم خدمات شاملة تبدأ من التصميم والتنفيذ وحتى التشغيل والصيانة، وفق أعلى معايير الجودة والسلامة والاحترافية، بما يتماشى مع رؤية المملكة العربية السعودية 2030.",
      cta_label: "من نحن",
      cta_href: "/about",
    },
    en: {
      title: "About the company",
      subtitle: "Experience and innovation in project delivery",
      body: "We deliver end-to-end services from design and execution through operation and maintenance, aligned with the highest standards of quality, safety, and professionalism — supporting Saudi Vision 2030.",
      cta_label: "About us",
      cta_href: "/about",
    },
  },
  stats: {
    ar: { title: "مؤشرات الأداء", subtitle: "إنجاز يُقاس بالأرقام", body: null, cta_label: null, cta_href: null },
    en: { title: "Performance indicators", subtitle: "Results measured in numbers", body: null, cta_label: null, cta_href: null },
  },
  vision: {
    ar: {
      title: "رؤيتنا",
      subtitle: null,
      body: "أن نكون الخيار الأول والرائد في مجال أعمال الكهروميكانيك والتشطيبات المعمارية والحلول التقنية الذكية في المملكة العربية السعودية.",
      cta_label: null,
      cta_href: null,
    },
    en: {
      title: "Our vision",
      subtitle: null,
      body: "To be the first and leading choice in electromechanical works, architectural finishing, and smart technical solutions in the Kingdom of Saudi Arabia.",
      cta_label: null,
      cta_href: null,
    },
  },
  mission: {
    ar: {
      title: "رسالتنا",
      subtitle: null,
      body: "نسعى لتقديم خدمات هندسية وتقنية متكاملة تعتمد على الجودة العالية والإبداع والدقة في التنفيذ.",
      cta_label: null,
      cta_href: null,
    },
    en: {
      title: "Our mission",
      subtitle: null,
      body: "We strive to provide integrated engineering and technical services grounded in high quality, creativity, and precision.",
      cta_label: null,
      cta_href: null,
    },
  },
  values: {
    ar: { title: "قيمنا", subtitle: "ما نلتزم به في كل تفاصيل العمل", body: null, cta_label: null, cta_href: null },
    en: { title: "Our values", subtitle: "What we uphold in every detail of our work", body: null, cta_label: null, cta_href: null },
  },
  services: {
    ar: { title: "خدماتنا", subtitle: "حلول متكاملة عبر قطاعات متعددة", body: null, cta_label: "كل الخدمات", cta_href: "/services" },
    en: { title: "Our services", subtitle: "Integrated solutions across multiple sectors", body: null, cta_label: "All services", cta_href: "/services" },
  },
  cta: {
    ar: {
      title: "لنبدأ مشروعك التالي",
      subtitle: "حلول موثوقة تلبي تطلعات عملائنا وتواكب متطلبات السوق ورؤية المملكة 2030.",
      body: null,
      cta_label: "تواصل معنا",
      cta_href: "/contact",
    },
    en: {
      title: "Let us start your next project",
      subtitle: "Trusted solutions that meet client ambitions and keep pace with the market and Vision 2030.",
      body: null,
      cta_label: "Contact us",
      cta_href: "/contact",
    },
  },
  contact_map: {
    ar: { title: "موقعنا", subtitle: "الرياض، المملكة العربية السعودية", body: null, cta_label: null, cta_href: null },
    en: { title: "Our location", subtitle: "Riyadh, Kingdom of Saudi Arabia", body: null, cta_label: null, cta_href: null },
  },
};

const slideCopy: Record<AppLocale, Array<{ title: string; subtitle: string; cta_label: string; media_url: string; link_url: string }>> = {
  ar: [
    {
      title: "أعمال كهروميكانيكية متكاملة",
      subtitle: "كهرباء وميكانيكا وفق أعلى المعايير",
      cta_label: "استكشف الخدمات",
      media_url: "/images/placeholders/hero-1.svg",
      link_url: "/services",
    },
    {
      title: "تشطيبات معمارية راقية",
      subtitle: "نحوّل المساحات إلى لوحات فنية متكاملة",
      cta_label: "تعرف علينا",
      media_url: "/images/placeholders/hero-2.svg",
      link_url: "/about",
    },
    {
      title: "حلول تقنية وأنظمة ذكية",
      subtitle: "أمن، شبكات، وأتمتة منزلية ومؤسسية",
      cta_label: "تواصل معنا",
      media_url: "/images/placeholders/hero-3.svg",
      link_url: "/contact",
    },
  ],
  en: [
    {
      title: "Integrated electromechanical works",
      subtitle: "Electrical and mechanical excellence",
      cta_label: "Explore services",
      media_url: "/images/placeholders/hero-1.svg",
      link_url: "/services",
    },
    {
      title: "Premium architectural finishing",
      subtitle: "Transforming spaces into integrated art",
      cta_label: "About us",
      media_url: "/images/placeholders/hero-2.svg",
      link_url: "/about",
    },
    {
      title: "Smart systems and IT solutions",
      subtitle: "Security, networks, and automation",
      cta_label: "Contact us",
      media_url: "/images/placeholders/hero-3.svg",
      link_url: "/contact",
    },
  ],
};

export function previewHomepageSections(locale: AppLocale): HomepageSection[] {
  const keys = [
    "hero",
    "about",
    "stats",
    "vision",
    "mission",
    "values",
    "services",
    "cta",
    "contact_map",
  ] as const;

  return keys.map((key, index) => {
    const copy = sectionCopy[key]![locale];
    return {
      id: `preview-section-${key}`,
      key,
      sort_order: index + 1,
      is_enabled: true,
      settings: key === "hero" ? { autoplay: true, interval_ms: 6000 } : {},
      title: copy.title,
      subtitle: copy.subtitle,
      body: copy.body,
      cta_label: copy.cta_label,
      cta_href: copy.cta_href,
      slides:
        key === "hero"
          ? slideCopy[locale].map((slide, i) => ({
              id: `preview-slide-${i + 1}`,
              media_url: slide.media_url,
              sort_order: i + 1,
              is_enabled: true,
              link_url: slide.link_url,
              title: slide.title,
              subtitle: slide.subtitle,
              cta_label: slide.cta_label,
            }))
          : [],
    };
  });
}

export function previewAboutContent(locale: AppLocale): AboutContent {
  const ar = locale === "ar";
  return {
    id: "77777777-7777-7777-7777-777777777001",
    cover_image_url: "/images/about-company.png",
    video_url: null,
    ceo_image_url: null,
    history: ar
      ? "تُعد ماستر تاتش إحدى الشركات المتخصصة في تقديم أعمال الكهروميكانيك والتشطيبات المعمارية والأنظمة التقنية المتكاملة في المملكة العربية السعودية."
      : "Master Touch is a specialized Saudi company delivering electromechanical works, architectural finishing, and integrated technical systems across the Kingdom.",
    vision: ar
      ? "أن نكون الخيار الأول والرائد في مجال أعمال الكهروميكانيك والتشطيبات المعمارية والحلول التقنية الذكية في المملكة العربية السعودية."
      : "To be the first and leading choice in electromechanical works, architectural finishing, and smart technical solutions in Saudi Arabia.",
    mission: ar
      ? "نسعى لتقديم خدمات هندسية وتقنية متكاملة تعتمد على الجودة العالية والإبداع والدقة في التنفيذ."
      : "We strive to provide integrated engineering and technical services grounded in high quality, creativity, and precision.",
    objectives: ar
      ? "نطمح إلى توسيع حضورنا في السوق السعودي والعالمي، وتعزيز شراكاتنا الاستراتيجية بما يدعم رؤية المملكة 2030."
      : "We aspire to expand our presence and strengthen strategic partnerships supporting Vision 2030.",
    ceo_message: ar
      ? "في ماستر تاتش نسعى لأن نكون الخيار الأول والرائد في مجال التشطيبات والأعمال الكهروميكانيكية والحلول التقنية الذكية."
      : "At Master Touch we strive to be the first and leading choice in finishing, electromechanical works, and smart technical solutions.",
    ceo_name: ar ? "م. محمد الصادق" : "Eng. Mohammed Elsadig",
    ceo_title: ar ? "الرئيس التنفيذي" : "Chief Executive Officer",
    values: [
      { id: "v1", icon: "Award", sort_order: 1, title: ar ? "الجودة والتميز" : "Quality and excellence", description: ar ? "في كل تفاصيل العمل" : "In every detail of the work" },
      { id: "v2", icon: "Clock", sort_order: 2, title: ar ? "الالتزام بالمواعيد" : "Commitment to deadlines", description: ar ? "والمعايير الهندسية والعالمية" : "And engineering and global standards" },
      { id: "v3", icon: "ShieldCheck", sort_order: 3, title: ar ? "النزاهة والشفافية" : "Integrity and transparency", description: ar ? "في التعامل مع العملاء والشركاء" : "In dealing with clients and partners" },
      { id: "v4", icon: "Sparkles", sort_order: 4, title: ar ? "الابتكار المستمر" : "Continuous innovation", description: ar ? "وتطوير الكفاءات والتقنيات" : "Developing talent and technologies" },
      { id: "v5", icon: "HardHat", sort_order: 5, title: ar ? "السلامة أولاً" : "Safety first", description: ar ? "في كل مشروع ومنشأة" : "On every project and facility" },
      { id: "v6", icon: "Headset", sort_order: 6, title: ar ? "الدعم التقني المتكامل" : "Integrated technical support", description: ar ? "لضمان استمرارية وكفاءة الأنظمة" : "Ensuring system continuity and efficiency" },
    ],
    stats: [
      { id: "s1", icon: "CheckCircle2", value: "98%", sort_order: 1, label: ar ? "نسبة إنجاز المشاريع في الوقت المحدد" : "Projects completed on time" },
      { id: "s2", icon: "Smile", value: "96%", sort_order: 2, label: ar ? "رضا العملاء" : "Client satisfaction" },
      { id: "s3", icon: "TrendingUp", value: "82%", sort_order: 3, label: ar ? "نمو سنوي متصاعد" : "Rising annual growth" },
      { id: "s4", icon: "Target", value: "92%", sort_order: 4, label: ar ? "اعتماد متوازن على أدوات الذكاء الاصطناعي وإنترنت الأشياء" : "Balanced adoption of AI and IoT tools" },
    ],
    timeline: [
      { id: "t1", event_year: "2020", sort_order: 1, title: ar ? "التأسيس والتخصص" : "Foundation and focus", description: ar ? "الانطلاق كشركة سعودية متخصصة في الحلول المتكاملة" : "Launching as a Saudi company specialized in integrated solutions" },
      { id: "t2", event_year: "2023", sort_order: 2, title: ar ? "توسيع القدرات التقنية" : "Expanding technical capability", description: ar ? "تعزيز حلول الأنظمة الذكية وتقنية المعلومات" : "Strengthening smart systems and IT solutions" },
      { id: "t3", event_year: "2026", sort_order: 3, title: ar ? "ملف الشركة 2026" : "Company profile 2026", description: ar ? "مواصلة النمو بما يتماشى مع رؤية المملكة 2030" : "Continued growth aligned with Vision 2030" },
    ],
  };
}

const servicesByLocale: Record<AppLocale, ServiceItem[]> = {
  ar: [
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01",
      slug: "electromechanical",
      icon: "Zap",
      cover_image_url: "/images/placeholders/service-mep.svg",
      is_featured: true,
      is_published: true,
      sort_order: 1,
      title: "الأعمال الكهروميكانيكية",
      summary: "حلول متكاملة للكهرباء والميكانيكا (MEP)",
      description:
        "نقدّم حلولاً متكاملة تشمل الأعمال الكهربائية والميكانيكية وأنظمة مكافحة الحريق وفق معايير الدفاع المدني.",
      seo_title: "الأعمال الكهروميكانيكية | ماستر تاتش",
      seo_description: "خدمات MEP متكاملة للكهرباء والميكانيكا في المملكة العربية السعودية",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02",
      slug: "architectural-finishing",
      icon: "Paintbrush",
      cover_image_url: "/images/placeholders/service-finishing.svg",
      is_featured: true,
      is_published: true,
      sort_order: 2,
      title: "التشطيبات المعمارية",
      summary: "نحوّل المساحات إلى لوحات فنية متكاملة",
      description: "جبس، دهانات، بلاط، ديكور، ألمنيوم وزجاج، لياسة وترميمات.",
      seo_title: "التشطيبات المعمارية | ماستر تاتش",
      seo_description: "تشطيبات معمارية متكاملة للمساحات السكنية والتجارية",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03",
      slug: "smart-it-solutions",
      icon: "Cpu",
      cover_image_url: "/images/placeholders/service-smart.svg",
      is_featured: true,
      is_published: true,
      sort_order: 3,
      title: "الحلول التقنية والأنظمة الذكية",
      summary: "أمن، شبكات، بنية تحتية تقنية وأتمتة",
      description: "مراقبة، سيرفرات، بصمة، شبكات، بنية تحتية، ومنازل ذكية.",
      seo_title: "الحلول التقنية والأنظمة الذكية | ماستر تاتش",
      seo_description: "حلول IT وأنظمة ذكية موثوقة للشركات والمؤسسات",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04",
      slug: "maintenance-operation",
      icon: "Wrench",
      cover_image_url: "/images/placeholders/service-ops.svg",
      is_featured: true,
      is_published: true,
      sort_order: 4,
      title: "أعمال الصيانة والتشغيل المتكاملة",
      summary: "نضمن استمرارية وكفاءة المنشآت",
      description: "صيانة وقائية وتشغيل مرافق ودعم فني للأنظمة التقنية.",
      seo_title: "الصيانة والتشغيل | ماستر تاتش",
      seo_description: "صيانة وتشغيل متكامل للمنشآت السكنية والتجارية",
    },
  ],
  en: [
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01",
      slug: "electromechanical",
      icon: "Zap",
      cover_image_url: "/images/placeholders/service-mep.svg",
      is_featured: true,
      is_published: true,
      sort_order: 1,
      title: "Electromechanical Works",
      summary: "Integrated electrical and mechanical (MEP) solutions",
      description:
        "Integrated electrical and mechanical works including firefighting systems per civil defense standards.",
      seo_title: "Electromechanical Works | Master Touch",
      seo_description: "Integrated MEP electrical and mechanical services in Saudi Arabia",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02",
      slug: "architectural-finishing",
      icon: "Paintbrush",
      cover_image_url: "/images/placeholders/service-finishing.svg",
      is_featured: true,
      is_published: true,
      sort_order: 2,
      title: "Architectural Finishing",
      summary: "Transforming spaces into integrated works of art",
      description: "Gypsum, painting, tiling, décor, aluminum and glass, plastering and renovations.",
      seo_title: "Architectural Finishing | Master Touch",
      seo_description: "Integrated architectural finishing for residential and commercial spaces",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03",
      slug: "smart-it-solutions",
      icon: "Cpu",
      cover_image_url: "/images/placeholders/service-smart.svg",
      is_featured: true,
      is_published: true,
      sort_order: 3,
      title: "Smart Systems & IT Solutions",
      summary: "Security, networks, IT infrastructure and automation",
      description: "CCTV, servers, access control, networks, infrastructure, and smart homes.",
      seo_title: "Smart Systems & IT Solutions | Master Touch",
      seo_description: "Trusted IT and smart systems for companies and institutions",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04",
      slug: "maintenance-operation",
      icon: "Wrench",
      cover_image_url: "/images/placeholders/service-ops.svg",
      is_featured: true,
      is_published: true,
      sort_order: 4,
      title: "Integrated Maintenance & Operation",
      summary: "Ensuring facility continuity and efficiency",
      description: "Preventive maintenance, facility operation, and technical support.",
      seo_title: "Maintenance & Operation | Master Touch",
      seo_description: "Integrated maintenance and operation for residential and commercial facilities",
    },
  ],
};

export function previewServices(locale: AppLocale): ServiceItem[] {
  return servicesByLocale[locale];
}

export function previewContactContent(locale: AppLocale): ContactContent {
  const ar = locale === "ar";
  return {
    id: "cccccccc-cccc-cccc-cccc-cccccccccc01",
    map_embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.0!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1700000000000",
    working_hours_json: {
      ar: { sunday_thursday: "8:00 ص – 5:00 م", friday: "مغلق", saturday: "حسب الموعد" },
      en: { sunday_thursday: "8:00 AM – 5:00 PM", friday: "Closed", saturday: "By appointment" },
    },
    is_form_enabled: true,
    notify_email: "info@mastertouchksa.com",
    headline: ar ? "تواصل معنا" : "Contact us",
    intro: ar ? "يسعدنا استقبال استفساراتكم ومشاريعكم القادمة." : "We welcome your inquiries and upcoming projects.",
    form_success_message: ar
      ? "تم إرسال رسالتكم بنجاح. سنتواصل معكم قريباً."
      : "Your message was sent successfully. We will get back to you soon.",
    branches: [
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccc02",
        name: ar ? "المقر الرئيسي" : "Head Office",
        address: ar ? "الرياض" : "Riyadh",
        city: ar ? "الرياض" : "Riyadh",
        country: ar ? "المملكة العربية السعودية" : "Kingdom of Saudi Arabia",
        latitude: 24.7136,
        longitude: 46.6753,
        is_primary: true,
      },
    ],
    channels: [
      { id: "c1", channel_type: "email", value: "info@mastertouchksa.com", label: "Email", is_primary: true },
      { id: "c2", channel_type: "phone", value: "+966-50-683-4610", label: "Phone", is_primary: true },
      { id: "c3", channel_type: "whatsapp", value: "+966506834610", label: "WhatsApp", is_primary: false },
      { id: "c4", channel_type: "other", value: "www.mastertouchksa.com", label: "Website", is_primary: false },
    ],
  };
}

export function previewPageSeo(slug: string, locale: AppLocale): PageSeo | null {
  const brand = locale === "ar" ? "ماستر تاتش" : "Master Touch";
  const titles: Record<string, { ar: string; en: string }> = {
    home: { ar: "الرئيسية", en: "Home" },
    about: { ar: "من نحن", en: "About" },
    services: { ar: "خدماتنا", en: "Services" },
    contact: { ar: "تواصل معنا", en: "Contact" },
  };
  const title = titles[slug]?.[locale];
  if (!title) return null;
  return {
    meta_title: `${title} | ${brand}`,
    meta_description:
      locale === "ar"
        ? "شركة سعودية متخصصة في الأعمال الكهروميكانيكية والتشطيبات والأنظمة الذكية."
        : "A Saudi company specialized in electromechanical works, finishing, and smart systems.",
    meta_keywords: null,
    og_title: `${title} | ${brand}`,
    og_description: null,
    og_image_url: null,
    canonical_url: null,
    robots: "index,follow",
  };
}
