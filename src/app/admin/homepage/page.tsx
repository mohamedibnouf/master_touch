import { getHomepageSectionsPair } from "@/infrastructure/repositories/content.repository";
import { HomepageCmsClient } from "@/presentation/features/homepage/HomepageCmsClient";

export default async function AdminHomepagePage() {
  const { ar, en } = await getHomepageSectionsPair();
  return <HomepageCmsClient sectionsAr={ar} sectionsEn={en} />;
}
