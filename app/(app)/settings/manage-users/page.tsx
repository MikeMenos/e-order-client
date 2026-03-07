"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore, useEffectiveSelectedUser } from "@/stores/auth";
import { useUsersForStore, useUsersToggleActive } from "@/hooks/useUsers";
import { getApiErrorMessage } from "@/lib/api-error";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import type { StoreUser } from "@/lib/types/users";
import { listVariants, listItemVariants } from "@/lib/motion";
import { UserTile } from "@/components/settings/UserTile";
import { UserProfileDialog } from "@/components/settings/UserProfileDialog";

export default function ManageUsersPage() {
  const { t } = useTranslation();
  const users = useAuthStore((s) => s.users);
  const effectiveUser = useEffectiveSelectedUser();
  const selectedStoreUID = useAuthStore((s) => s.selectedStoreUID);

  const storeUID = useMemo(() => {
    return (
      selectedStoreUID ||
      effectiveUser?.store?.storeUID ||
      users?.role?.store?.storeUID ||
      null
    );
  }, [selectedStoreUID, users, effectiveUser]);

  const usersQuery = useUsersForStore(storeUID);
  const listUsers = usersQuery.data?.listUsers ?? [];

  const toggleMutation = useUsersToggleActive({
    onSuccess: () => {
      usersQuery.refetch();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("settings_user_toggle_error")));
    },
  });
  const [selectedUserUID, setSelectedUserUID] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [profileOpenInEdit, setProfileOpenInEdit] = useState(false);

  const handleViewUser = useCallback((user: StoreUser) => {
    setSelectedUserUID(user.appUserUID);
    setProfileOpenInEdit(false);
    setProfileOpen(true);
  }, []);

  const handleEditUser = useCallback((user: StoreUser) => {
    setSelectedUserUID(user.appUserUID);
    setProfileOpenInEdit(true);
    setProfileOpen(true);
  }, []);

  const handleProfileOpenChange = useCallback((open: boolean) => {
    setProfileOpen(open);
    if (!open) setProfileOpenInEdit(false);
  }, []);

  return (
    <main className="text-slate-900 px-3">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 mb-4">
          <h1 className="text-xl font-bold text-slate-900 text-center sm:text-left">
            {t("settings_manage_users")}
          </h1>
          <Button
            onClick={() => setAddUserOpen(true)}
            className="w-full sm:w-auto shrink-0"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("settings_create_user")}
          </Button>
        </div>

        {usersQuery.isLoading && <Loading spinnerOnly />}

        {usersQuery.error && (
          <p className="text-base text-red-400">
            {getApiErrorMessage(
              usersQuery.error as Error,
              t("config_error_users"),
            )}
          </p>
        )}

        {!usersQuery.isLoading && !usersQuery.error && (
          <>
            {listUsers.length === 0 ? (
              <p className="text-base text-slate-400 rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 inline-block">
                {t("config_empty_users")}
              </p>
            ) : (
              <motion.div
                className="space-y-3 pb-8"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {listUsers.map((u: StoreUser) => (
                  <motion.div key={u.appUserUID} variants={listItemVariants}>
                    <UserTile
                      user={u}
                      onView={() => handleViewUser(u)}
                      onEdit={() => handleEditUser(u)}
                      onToggleActive={() =>
                        u.appUserUID && toggleMutation.mutate(u.appUserUID)
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      <UserProfileDialog
        appUserUID={selectedUserUID}
        open={profileOpen}
        onOpenChange={handleProfileOpenChange}
        onSaved={() => usersQuery.refetch()}
        initialEdit={profileOpenInEdit}
      />

      <UserProfileDialog
        appUserUID={null}
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSaved={() => usersQuery.refetch()}
        isAddMode
      />
    </main>
  );
}
