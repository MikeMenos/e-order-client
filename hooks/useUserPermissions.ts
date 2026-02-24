import { useMemo } from "react";
import { useEffectiveSelectedUser } from "@/stores/auth";

/** Permission codes for userTypeId === 3 (Employee) */
export const PERMISSION_CODES = {
  P1: "P1", // View prices
  P2: "P2", // Change supplier names (Μεταβολή ονομασίας προμηθευτών)
  P3: "P3", // Change product names (Αλλαγή ονομασίας ειδών)
  P4: "P4", // Set order schedule (Ορισμός προγράμματος παραγγελιών)
  P5: "P5", // View order history (Προβολή ιστορικού παραγγελιών)
  P6: "P6", // Edit favorites (Επεξεργασία αγαπημένων)
} as const;

export type PermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];

/**
 * Returns a function to check if the current user has access to a permission.
 * For userTypeId 1 (Admin) and 2 (Deputy): always returns true.
 * For userTypeId 3 (Employee): checks policies from the selected store's storeAccess.
 */
export function useUserPermissions() {
  const effectiveUser = useEffectiveSelectedUser();

  return useMemo(() => {
    const userTypeId = effectiveUser?.userTypeId;
    const policies = effectiveUser?.policies as
      | { code: string; hasAccess: boolean }[]
      | undefined;

    const hasAccess = (code: PermissionCode | string): boolean => {
      // Admin (1) and Deputy (2) have full access
      if (userTypeId === 1 || userTypeId === 2) return true;
      // Employee (3): check policies
      if (userTypeId === 3 && policies?.length) {
        const policy = policies.find((p) => p.code === code);
        return policy?.hasAccess ?? false;
      }
      // Not logged in or no policies: deny
      return false;
    };

    return { hasAccess, userTypeId };
  }, [effectiveUser]);
}
