"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Store, ArrowLeft, Users, User, UserPlus } from "lucide-react";

import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { StoreSelectDialog } from "@/components/auth/StoreSelectDialog";

const tileClass =
  "flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md active:scale-[0.99]";

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
          toast.error(getApiErrorMessage(err, "Failed to select store"));
        });
    }

    router.push("/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <main className="text-slate-900">
      <div className="mx-auto flex max-w-md flex-col px-4 pb-8 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back?.()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/70"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" aria-hidden />
          </button>

          <h1 className="text-xl font-semibold text-slate-900">
            {t("settings_title")}
          </h1>
        </div>

        <div className="grid grid-cols-2 auto-rows-fr gap-4">
          <button
            type="button"
            onClick={() => setStoreDialogOpen(true)}
            disabled={roles.length === 0}
            className={tileClass + " disabled:opacity-50 disabled:cursor-not-allowed"}
          >
            <Store className="h-12 w-12 shrink-0 text-slate-700" aria-hidden />
            <span className="text-center text-sm font-medium text-slate-900">
              {t("Επιλογή Καταστήματος")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/settings/manage-suppliers")}
            className={tileClass}
          >
            <Users className="h-12 w-12 shrink-0 text-orange-500" aria-hidden />
            <span className="text-center text-sm font-medium text-slate-900">
              {t("Διαχείριση Προμηθευτών")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/settings/account")}
            className={tileClass}
          >
            <User className="h-12 w-12 shrink-0 text-slate-700" aria-hidden />
            <span className="text-center text-sm font-medium text-slate-900">
              {t("Edit Account")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/users/add")}
            className={tileClass}
          >
            <UserPlus className="h-12 w-12 shrink-0 text-blue-600" aria-hidden />
            <span className="text-center text-sm font-medium text-slate-900">
              {t("Δημιουργία Χρήστη")}
            </span>
          </button>
        </div>

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
