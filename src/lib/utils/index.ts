export { cn } from "./cn";

export function isRtl(locale: string): boolean {
  return locale === "ar";
}

export function getDirection(locale: string): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}
