import { listAdminRolesAction, listAdminUsersAction } from "@/actions/admin-directory";
import { can, getCurrentUserPermissions } from "@/lib/permissions";
import { UsersAdminClient } from "@/presentation/features/admin/UsersAdminClient";

/**
 * Users admin page.
 * Always renders UsersAdminClient (including Invite User) — never replace the
 * whole page with EmptyState alone, which previously hid the invite button.
 */
export default async function AdminUsersPage() {
  const [usersResult, rolesResult, permissions] = await Promise.all([
    listAdminUsersAction(),
    listAdminRolesAction(),
    getCurrentUserPermissions(),
  ]);

  const canManageUsers = can(permissions, "users.manage");
  const canSuperManage = permissions.includes("*");

  return (
    <UsersAdminClient
      users={[...usersResult.data]}
      roles={[...rolesResult.data]}
      canManage={canManageUsers}
      canSuperManage={canSuperManage}
      listError={usersResult.ok ? null : usersResult.error}
    />
  );
}
