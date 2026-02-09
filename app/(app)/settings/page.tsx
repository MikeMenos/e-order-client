"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Store, ArrowLeft, Users, User, UserPlus } from "lucide-react";

import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { listVariants, listItemVariants } from "@/lib/motion";
import { StoreSelectDialog } from "@/components/auth/StoreSelectDialog";
import { Button } from "@/components/ui/button";

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
      <div className="mx-auto flex max-w-md flex-col px-4 pb-8 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <Button
            type="button"
            onClick={() => router.back?.()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/70 hover:bg-slate-100 p-0"
            aria-label={t("aria_back")}
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" aria-hidden />
          </Button>

          <h1 className="text-xl font-semibold text-slate-900">
            {t("settings_title")}
          </h1>
        </div>

        <motion.div
          className="grid grid-cols-2 auto-rows-fr gap-4"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={listItemVariants}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => roles.length > 0 && setStoreDialogOpen(true)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && roles.length > 0) {
                  e.preventDefault();
                  setStoreDialogOpen(true);
                }
              }}
              className={`flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md ${
                roles.length === 0
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
            >
              <Store
                className="h-12 w-12 shrink-0 text-slate-700"
                aria-hidden
              />
              <span className="text-center text-sm font-medium text-slate-900">
                {t("settings_switch_store")}
              </span>
            </div>
          </motion.div>

          <motion.div variants={listItemVariants}>
            <Link
              href="/settings/manage-suppliers"
              className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md"
            >
              <Users
                className="h-12 w-12 shrink-0 text-orange-500"
                aria-hidden
              />
              <span className="text-center text-sm font-medium text-slate-900">
                {t("settings_manage_suppliers")}
              </span>
            </Link>
          </motion.div>

          <motion.div variants={listItemVariants}>
            <Link
              href="/settings/account"
              className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md"
            >
              <User className="h-12 w-12 shrink-0 text-slate-700" aria-hidden />
              <span className="text-center text-sm font-medium text-slate-900">
                {t("settings_edit_account")}
              </span>
            </Link>
          </motion.div>

          <motion.div variants={listItemVariants}>
            <Link
              href="/users/add"
              className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md"
            >
              <UserPlus
                className="h-12 w-12 shrink-0 text-blue-600"
                aria-hidden
              />
              <span className="text-center text-sm font-medium text-slate-900">
                {t("settings_create_user")}
              </span>
            </Link>
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
