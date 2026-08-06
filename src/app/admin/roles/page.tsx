import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/presentation/components/admin/AsyncStates";
import { listAdminRolesAction } from "@/actions/admin-directory";
import { can, getCurrentUserPermissions } from "@/lib/permissions";
import { RolesAdminClient } from "@/presentation/features/admin/RolesAdminClient";

export default async function AdminRolesPage() {
  const t = await getTranslations("admin");
  const [result, permissions] = await Promise.all([
    listAdminRolesAction(),
    getCurrentUserPermissions(),
  ]);
  const canManageRoles = can(permissions, "roles.manage");

  if (!result.ok && !result.data.length) {
    return <EmptyState title={t("roles")} description={result.error} />;
  }

  return <RolesAdminClient roles={[...result.data]} canManage={canManageRoles} />;
}
