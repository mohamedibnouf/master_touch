import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/presentation/components/admin/AsyncStates";
import { listAdminRolesAction, listAdminUsersAction } from "@/actions/admin-directory";
import { can, getCurrentUserPermissions } from "@/lib/permissions";
import { UsersAdminClient } from "@/presentation/features/admin/UsersAdminClient";

export default async function AdminUsersPage() {
  const t = await getTranslations("admin");
  const [usersResult, rolesResult, permissions] = await Promise.all([
    listAdminUsersAction(),
    listAdminRolesAction(),
    getCurrentUserPermissions(),
  ]);
  const canManageUsers = can(permissions, "users.manage");

  if (!usersResult.ok && !usersResult.data.length) {
    return <EmptyState title={t("users")} description={usersResult.error} />;
  }

  return (
    <UsersAdminClient
      users={[...usersResult.data]}
      roles={[...rolesResult.data]}
      canManage={canManageUsers}
    />
  );
}
