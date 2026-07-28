import type { AppLocale } from "@/types/cms";

export interface ContentLocalePair<T> {
  ar: T;
  en: T;
}

export function pickLocale<T>(pair: ContentLocalePair<T>, locale: AppLocale): T {
  return pair[locale] ?? pair.en;
}
