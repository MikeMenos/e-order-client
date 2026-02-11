"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Store, User, UserPlus, LogOut } from "lucide-react";

import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
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

  const handleLogout = () => {
    logout();
    router.replace("/");
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
          <motion.div variants={listItemVariants}>
            <TileCard
              href="/settings/manage-suppliers"
              iconSrc="/assets/manage-suppliers.png"
              label={t("settings_manage_suppliers")}
            />
          </motion.div>

          <motion.div variants={listItemVariants}>
            <TileCard
              href="/settings/partner-suppliers"
              iconSrc="/assets/collab-suppliers.png"
              label={t("dashboard_card_partner_suppliers")}
            />
          </motion.div>

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
              href="/settings/account"
              icon={User}
              label={t("settings_edit_account_button")}
              iconColor="text-slate-700"
            />
          </motion.div>

          <motion.div variants={listItemVariants}>
            <TileCard
              href="/settings/add"
              icon={UserPlus}
              label={t("settings_create_user")}
              iconColor="text-blue-600"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 w-full"
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
        >
          <Button
            onClick={handleLogout}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-red-500 px-6 py-4 text-sm font-medium shadow-sm transition hover:border-red-200 hover:bg-red-50 text-white hover:text-red-700 active:scale-[0.99]"
            aria-label={t("logout")}
          >
            <LogOut
              className="h-5 w-5 shrink-0 text-white transition-colors group-hover:text-red-600"
              aria-hidden
            />
            {t("logout")}
          </Button>
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
