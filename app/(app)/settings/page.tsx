"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Home, Store, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StoreSelectDialog } from "@/components/auth/StoreSelectDialog";

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);

  const {
    users,
    selectedUser,
    logout,
    setSelectedUser,
    setStoreAccessToken,
    setLoggedIn,
  } = useAuthStore();

  const roles = useMemo(
    () => users?.userInfos?.storeAccess ?? [],
    [users?.userInfos?.storeAccess]
  );

  const userName = useMemo(
    () =>
      [users?.userInfos?.fname, users?.userInfos?.lname]
        .filter(Boolean)
        .join(" ") || "",
    [users?.userInfos?.fname, users?.userInfos?.lname]
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
        });
    }
    router.push("/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const cardStyle =
    "flex items-center gap-3 rounded-2xl p-4 shadow-sm transition hover:shadow-md";

  return (
    <main className="text-slate-900">
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <h1 className="mb-2 text-lg font-semibold text-slate-900">
          {t("settings_title")}
        </h1>

        <Button
          type="button"
          variant="outline"
          onClick={() => setStoreDialogOpen(true)}
          disabled={roles.length === 0}
          className={`${cardStyle} w-full justify-start text-slate-900 bg-app-card`}
        >
          <Store className="h-6 w-6 shrink-0 text-slate-600" aria-hidden />
          <span>{t("nav_switch_store")}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          className={`${cardStyle} w-full justify-start text-red-700 hover:bg-red-50/50 bg-app-card`}
        >
          <LogOut className="h-6 w-6 shrink-0" aria-hidden />
          <span>{t("logout")}</span>
        </Button>
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
