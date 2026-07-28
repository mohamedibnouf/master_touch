import { getHomepageSections } from "@/infrastructure/repositories/content.repository";
import { HomepageCmsClient } from "@/presentation/features/homepage/HomepageCmsClient";

export default async function AdminHomepagePage() {
  const [sectionsAr, sectionsEn] = await Promise.all([
    getHomepageSections("ar"),
    getHomepageSections("en"),
  ]);
  return <HomepageCmsClient sectionsAr={sectionsAr} sectionsEn={sectionsEn} />;
}
