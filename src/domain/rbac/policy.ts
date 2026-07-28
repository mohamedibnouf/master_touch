export type PermissionKey = string;

export interface RbacPolicy {
  can(userPermissions: string[], required: PermissionKey): boolean;
}

export const rbacPolicy: RbacPolicy = {
  can(userPermissions, required) {
    if (userPermissions.includes("*")) return true;
    if (userPermissions.includes(required)) return true;
    const moduleName = required.split(".")[0];
    return userPermissions.includes(`${moduleName}.manage`);
  },
};
