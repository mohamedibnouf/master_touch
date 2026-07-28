import type { AppLocale } from "@/types/cms";

export const locales = ["ar", "en"] as const satisfies readonly AppLocale[];
export const defaultLocale: AppLocale = "ar";

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
