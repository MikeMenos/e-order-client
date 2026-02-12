"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../../../stores/auth";
import { useUsersForStore } from "../../../../hooks/useUsers";
import { useTranslation } from "../../../../lib/i18n";
import { listVariants, listItemVariants } from "../../../../lib/motion";

export default function UsersManagementPage() {
  const { t } = useTranslation();
  const { users, selectedUser } = useAuthStore();

  const storeUID = useMemo(() => {
    if (!users && !selectedUser) return null;
    return users?.hasSelectedStore === true
      ? users?.selectedStoreUID
      : selectedUser?.store?.storeUID
        ? selectedUser.store.storeUID
        : (users?.role?.store?.storeUID ?? null);
  }, [users, selectedUser]);

  const usersQuery = useUsersForStore(storeUID);

  const userList = usersQuery.data?.usersList ?? [];

  return (
    <main className="space-y-3 text-slate-900">
      <header className="space-y-1">
        <p className="text-sm text-slate-600">{t("config_users_subtitle")}</p>
        {storeUID && (
          <p className="text-sm text-slate-700">
            {t("config_users_store_uid")}{" "}
            <span className="font-mono">{storeUID}</span>
          </p>
        )}
      </header>

      {usersQuery.isLoading && (
        <p className="text-sm text-slate-500">{t("config_loading_users")}</p>
      )}
      {usersQuery.error && (
        <p className="text-sm text-red-400">{t("config_error_users")}</p>
      )}

      {userList.length === 0 && !usersQuery.isLoading ? (
        <p className="text-sm text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">{t("config_empty_users")}</p>
      ) : (
        <motion.div
          className="space-y-2"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {userList.map((u: any) => (
            <motion.div
              key={u.appUserUID}
              variants={listItemVariants}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {u.fname} {u.lname}
                </p>
                <p className="text-sm text-slate-600">
                  {u.email ?? u.username}
                </p>
              </div>
              <span className="shrink-0 text-sm text-slate-700">
                {u.userType}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
