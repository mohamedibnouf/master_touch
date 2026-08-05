import { getTranslations } from "next-intl/server";
import { getOwnProfileAction } from "@/actions/admin-directory";
import { ProfileClient } from "@/presentation/features/admin/ProfileClient";

export default async function AdminProfilePage() {
  const t = await getTranslations("admin");
  const profile = await getOwnProfileAction();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("profile")}</h1>
      <ProfileClient
        fullName={profile.data?.full_name ?? ""}
        email={profile.data?.email ?? ""}
      />
    </div>
  );
}
