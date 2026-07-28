import type { AppLocale } from "@/types/cms";
import {
  getAboutContent,
  getHomepageSections,
  getServices,
  getContactContent,
  getThemeSettings,
  getSiteSettings,
} from "@/infrastructure/repositories/content.repository";

export const homepageService = {
  listSections: (locale: AppLocale) => getHomepageSections(locale),
};

export const aboutService = {
  get: (locale: AppLocale) => getAboutContent(locale),
};

export const servicesService = {
  list: (locale: AppLocale) => getServices(locale),
};

export const contactService = {
  get: (locale: AppLocale) => getContactContent(locale),
};

export const themeService = {
  get: () => getThemeSettings(),
};

export const settingsService = {
  get: () => getSiteSettings(),
};
