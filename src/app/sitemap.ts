import type { MetadataRoute } from "next";
import { getServices } from "@/infrastructure/repositories/content.repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com";
  const locales = ["ar", "en"] as const;
  const paths = ["", "/about", "/services", "/contact"];

  const staticEntries = locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
  );

  try {
    const [arServices, enServices] = await Promise.all([getServices("ar"), getServices("en")]);
    const serviceEntries = [
      ...arServices.map((s) => ({
        url: `${base}/ar/services/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...enServices.map((s) => ({
        url: `${base}/en/services/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
    return [...staticEntries, ...serviceEntries];
  } catch {
    return staticEntries;
  }
}
