"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Store, Users, User, UserPlus } from "lucide-react";

import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { listVariants, listItemVariants } from "@/lib/motion";
import { StoreSelectDialog } from "@/components/auth/StoreSelectDialog";
import { TileCard } from "@/components/ui/tile-card";

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [storeDialogOpen, setStoreDialogOpen] = useState(false);

  const { users, logout, setSelectedUser, setStoreAccessToken, setLoggedIn } =
    useAuthStore();

  const roles = useMemo(
    () => users?.userInfos?.storeAccess ?? [],
    [users?.userInfos?.storeAccess],
  );

  const userName = useMemo(
    () =>
      [users?.userInfos?.fname, users?.userInfos?.lname]
        .filter(Boolean)
        .join(" ") || "",
    [users?.userInfos?.fname, users?.userInfos?.lname],
  );

  const handleSelectRole = (role: { store?: { storeUID?: string } }) => {
    setStoreDialogOpen(false);

    setSelectedUser(role);
    if (users) {
      setLoggedIn({
        isLoggedIn: true,
        isAddUser: false,
        users: { ...users, role },
      });
    }

    const storeUID = role?.store?.storeUID ?? null;
    if (storeUID) {
      api
        .get("/select-store", { params: { StoreUID: storeUID } })
        .then((res) => {
          setStoreAccessToken(res.data?.accessToken ?? null);
          queryClient.invalidateQueries();
        })
        .catch((err) => {
          console.error("select-store failed", err);
          toast.error(
            getApiErrorMessage(err, t("settings_select_store_error")),
          );
        });
    }

    router.push("/dashboard");
  };

  return (
    <main className="text-slate-900">
      <div className="mx-auto flex max-w-xl flex-col p-4">
        <motion.div
          className="grid grid-cols-2 auto-rows-fr gap-4"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {roles.length > 1 && (
            <motion.div variants={listItemVariants}>
              <TileCard
                icon={Store}
                label={t("settings_switch_store")}
                iconColor="text-slate-700"
                onClick={() => setStoreDialogOpen(true)}
              />
            </motion.div>
          )}

          <motion.div variants={listItemVariants}>
            <TileCard
              href="/settings/manage-suppliers"
              icon={Users}
              label={t("settings_manage_suppliers")}
              iconColor="text-orange-500"
            />
          </motion.div>

          <motion.div variants={listItemVariants}>
            <TileCard
              href="/settings/account"
              icon={User}
              label={t("settings_edit_account")}
              iconColor="text-slate-700"
            />
          </motion.div>

          <motion.div variants={listItemVariants}>
            <TileCard
              href="/users/add"
              icon={UserPlus}
              label={t("settings_create_user")}
              iconColor="text-blue-600"
            />
          </motion.div>
        </motion.div>
      </div>

      <StoreSelectDialog
        open={storeDialogOpen}
        onOpenChange={setStoreDialogOpen}
        roles={roles}
        userName={userName || undefined}
        onSelectRole={handleSelectRole}
      />
    </main>
  );
}
