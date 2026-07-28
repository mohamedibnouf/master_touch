import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "./config";
import { getCachedMessages } from "@/infrastructure/repositories/translations.repository";
import type { AppLocale } from "@/types/cms";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (requested && isLocale(requested) ? requested : defaultLocale) as AppLocale;

  let messages: Record<string, unknown>;
  try {
    messages = (await getCachedMessages(locale)) as Record<string, unknown>;
  } catch {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});
