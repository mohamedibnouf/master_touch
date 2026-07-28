import { getThemeSettings } from "@/infrastructure/repositories/content.repository";
import { ThemeManagerClient } from "@/presentation/features/theme/ThemeManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  const theme = await getThemeSettings();
  return <ThemeManagerClient initialTheme={theme} />;
}
