"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Store, LogOut,
  Users,
  ChevronDown,
  ChevronUp,
  User,
  Languages,
  Moon,
  Sun,
  Shield,
  Clock,
  Star,
  History,
} from "lucide-react";
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
  const [suppliersOpen, setSuppliersOpen] = useState(false);

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

  const subItemStyle =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-sm transition hover:shadow-md";


  return (
    <main className="text-slate-900">
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <h1 className="my-2 text-lg font-semibold text-slate-900">
          {t("settings_title")}
        </h1>

        <Button
          type="button"
          variant="outline"
          disabled={roles.length === 0}
          className={`${cardStyle} w-full justify-start text-slate-900 bg-app-card`}
        >
          <Shield className="h-6 w-6 shrink-0 text-slate-600" aria-hidden />
          <span>{t("Αλλαγή Ρόλου")}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setSuppliersOpen((v) => !v)}
          className={`${cardStyle} w-full justify-between text-slate-900 bg-app-card`}
        >
          <span className="flex items-center gap-3">
            <Users className="h-6 w-6 shrink-0 text-slate-600" aria-hidden />
            <span>{t("Διαχείριση Προμηθευτών")}</span>
          </span>
          {suppliersOpen ? (
            <ChevronUp className="h-5 w-5 text-slate-500" aria-hidden />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-500" aria-hidden />
          )}
        </Button>

        {suppliersOpen && (
          <div className="flex flex-col gap-2 pl-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/suppliers/timetable")}
              className={`${subItemStyle} w-full justify-start bg-app-card text-slate-800`}
            >
              <Clock className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
              <span>{t("Πρόγραμμα Παραγγελιών")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/suppliers/favorites")}
              className={`${subItemStyle} w-full justify-start bg-app-card text-slate-800`}
            >
              <Star className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
              <span>{t("Αγαπημένα")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/suppliers/order-history")}
              className={`${subItemStyle} w-full justify-start bg-app-card text-slate-800`}
            >
              <History className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
              <span>{t("Ιστορικό Παραγγελιών")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/suppliers/info")}
              className={`${subItemStyle} w-full justify-start bg-app-card text-slate-800`}
            >
              <Users className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
              <span>{t("Στοιχεία Προμηθευτή")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/suppliers/contact")}
              className={`${subItemStyle} w-full justify-start bg-app-card text-slate-800`}
            >
              <User className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
              <span>{t("Επικοινωνία")}</span>
            </Button>

          </div>
        )}


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
