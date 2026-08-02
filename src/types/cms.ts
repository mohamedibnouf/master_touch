export type AppLocale = "ar" | "en";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  locale: AppLocale;
}

export interface Role {
  id: string;
  slug: string;
  name_i18n: Record<string, string>;
  description_i18n: Record<string, string>;
  is_system: boolean;
}

export interface Permission {
  id: string;
  key: string;
  module: string;
  action: string;
}

export interface ThemeSettings {
  id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  font_sans: string;
  font_display: string;
  border_radius: string;
  button_style: Json;
  card_style: Json;
  animation_settings: Json;
  dark_mode_enabled: boolean;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  loader_url: string | null;
  custom_css: string | null;
}

export interface SiteSettings {
  id: string;
  site_name_i18n: Record<string, string>;
  tagline_i18n: Record<string, string>;
  default_locale: AppLocale;
  website_url: string | null;
  social_links: Record<string, string>;
  header_settings: Json;
  footer_settings: Json;
  maintenance_mode: boolean;
}

export interface LocalizedText {
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
}

export interface HomepageSlide {
  id: string;
  media_url: string | null;
  sort_order: number;
  is_enabled: boolean;
  link_url: string | null;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
}

export interface HomepageSection {
  id: string;
  key: string;
  sort_order: number;
  is_enabled: boolean;
  settings: Json;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  cta_label: string | null;
  cta_href: string | null;
  slides?: HomepageSlide[];
}

export interface AboutValue {
  id: string;
  icon: string | null;
  sort_order: number;
  title: string;
  description: string | null;
}

export interface AboutStat {
  id: string;
  icon: string | null;
  value: string;
  sort_order: number;
  label: string;
}

export interface AboutTimelineItem {
  id: string;
  event_year: string | null;
  sort_order: number;
  title: string;
  description: string | null;
}

export interface AboutContent {
  id: string;
  cover_image_url: string | null;
  video_url: string | null;
  ceo_image_url: string | null;
  history: string | null;
  vision: string | null;
  mission: string | null;
  objectives: string | null;
  ceo_message: string | null;
  ceo_name: string | null;
  ceo_title: string | null;
  values: AboutValue[];
  stats: AboutStat[];
  timeline: AboutTimelineItem[];
}

export interface ServiceItem {
  id: string;
  slug: string;
  icon: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  title: string;
  summary: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface ContactChannel {
  id: string;
  channel_type: "email" | "phone" | "whatsapp" | "fax" | "other";
  value: string;
  label: string | null;
  is_primary: boolean;
}

export interface ContactBranch {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
}

export interface ContactContent {
  id: string;
  map_embed_url: string | null;
  working_hours_json: Json;
  is_form_enabled: boolean;
  notify_email: string | null;
  headline: string | null;
  intro: string | null;
  form_success_message: string | null;
  branches: ContactBranch[];
  channels: ContactChannel[];
}

export interface PageSeo {
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image_url?: string | null;
  canonical_url: string | null;
  robots: string | null;
  schema_json?: unknown;
}

export interface MediaAsset {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string | null;
  mime_type: string | null;
  media_type: "image" | "video" | "document" | "other";
  alt_text: string | null;
  size_bytes: number | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
}

export interface TranslationRow {
  id: string;
  namespace: string;
  key: string;
  locale: AppLocale;
  value: string;
}
