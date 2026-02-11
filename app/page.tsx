"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { ergastirioStore } from "../stores/ergastirioStore";
import { useGetClientData } from "../hooks/useGetClientData";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { StoreSelectDialog } from "../components/auth/StoreSelectDialog";
import { useTranslation } from "../lib/i18n";
import { getApiErrorMessage } from "../lib/api-error";

const ERGASTIRIO_SESSION_COOKIE = "ergastirio_session";
const ERGASTIRIO_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export default function HomePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);
  const setSelectedUser = useAuthStore((s) => s.setSelectedUser);
  const setStoreAccessToken = useAuthStore((s) => s.setStoreAccessToken);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [userResponse, setUserResponse] = useState<any | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const getClientDataMutation = useGetClientData();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        username,
        password,
        platform: "web",
        appVersion: "1.0.0",
        deviceId: "web-browser",
        preselectedStoreUID: null,
      };
      const res = await api.post("/auth-login", payload);
      return res.data;
    },
    onSuccess: (data: any) => {
      const token = data?.accessToken ?? null;
      setAccessToken(token);

      if (token && typeof document !== "undefined") {
        document.cookie = `accessToken=${encodeURIComponent(
          token,
        )}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax`;
      }

      // Multiple stores: let user pick a role/store first
      if (
        data?.userInfos?.storeAccess &&
        data.userInfos.storeAccess.length > 1
      ) {
        setRoles(data.userInfos.storeAccess);
        setUserResponse(data);
        setShowRoleDialog(true);
        return;
      }

      // Single store: select store immediately then log in
      const singleStoreUID =
        data?.userInfos?.storeAccess?.[0]?.store?.storeUID ??
        data?.role?.store?.storeUID ??
        null;

      const finishLogin = () => {
        setLoggedIn({
          isLoggedIn: true,
          isAddUser: false,
          users: data,
        });
        toast.success(t("login_toast_success"));
        router.push("/dashboard");
      };

      if (singleStoreUID) {
        api
          .get("/select-store", {
            params: { StoreUID: singleStoreUID },
          })
          .then((res) => {
            setStoreAccessToken(res.data?.accessToken ?? null);
          })
          .catch((err) => {
            console.error("select-store (single store) failed", err);
            toast.error(getApiErrorMessage(err, t("login_toast_error")));
          })
          .finally(() => {
            finishLogin();
          });
      } else {
        finishLogin();
      }
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(getApiErrorMessage(err, t("login_toast_error")));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getClientDataMutation.mutate(
      { AFM: username.trim(), PIN: password },
      {
        onSuccess: (data) => {
          if (data?.success && data?.data?.length > 0) {
            const stores = data.data;
            const count = stores.length;
            const first = stores[0];

            ergastirioStore.getState().setVat(username.trim());
            ergastirioStore.getState().setClientData(stores);

            if (count === 1) {
              // Single store: preselect branch and carry basket id (if any)
              ergastirioStore.getState().setCurrentBranch(first);
              if (first?.BASKET_KEY && first.BASKET_KEY !== "0") {
                ergastirioStore.getState().setBasketId(first.BASKET_KEY);
              } else {
                ergastirioStore.getState().setBasketId(undefined);
              }
            } else {
              // Multiple stores: force user to pick a branch explicitly
              ergastirioStore.getState().setCurrentBranch(undefined);
              ergastirioStore.getState().setBasketId(undefined);
            }

            if (typeof document !== "undefined") {
              document.cookie = `${ERGASTIRIO_SESSION_COOKIE}=1; path=/; max-age=${ERGASTIRIO_SESSION_MAX_AGE}; sameSite=lax`;
            }
            toast.success(t("login_toast_success"));
            router.replace("/ergastirio");
            return;
          }
          loginMutation.mutate();
        },
        onError: () => {
          loginMutation.mutate();
        },
      },
    );
  };

  const handleSelectRole = (role: any) => {
    if (!userResponse) return;

    setShowRoleDialog(false);
    setSelectedUser(role);
    const combinedUserData = {
      ...userResponse,
      role,
    };
    setLoggedIn({
      isLoggedIn: true,
      isAddUser: false,
      users: combinedUserData,
    });
    const storeUID =
      role?.store?.storeUID ?? combinedUserData?.role?.store?.storeUID ?? null;
    if (storeUID) {
      api
        .get("/select-store", {
          params: { StoreUID: storeUID },
        })
        .then((res) => {
          setStoreAccessToken(res.data?.accessToken ?? null);
        })
        .catch((err) => {
          console.error("select-store (multi store) failed", err);
          toast.error(getApiErrorMessage(err, t("login_toast_error")));
        });
    }
    const token = userResponse?.accessToken;
    if (token && typeof document !== "undefined") {
      document.cookie = `accessToken=${encodeURIComponent(
        token,
      )}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax`;
    }
    router.push("/dashboard");
  };

  return (
    <main
      className="flex min-h-dvh flex-col items-center bg-cover bg-center bg-no-repeat text-slate-900"
      style={{ backgroundImage: "url(/assets/background.png)" }}
    >
      <div className="mb-6 flex w-full max-w-sm items-center justify-center px-4 mt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo.png"
          alt="E-Order"
          className="h-24 w-24 rounded-lg object-contain"
        />
      </div>
      <div className="w-full max-w-sm space-y-6 px-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl border border-slate-200/80 p-6 shadow-lg bg-app-card"
        >
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold text-slate-900">
              {t("login_title")}
            </h1>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                i18n.changeLanguage(i18n.language === "en" ? "gr" : "en")
              }
              className="shrink-0 rounded-full border border-slate-200/80 px-3 py-1 text-sm font-medium text-slate-700"
            >
              {i18n.language === "gr" ? t("lang_en") : t("lang_gr")}
            </Button>
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-slate-700">
              {t("login_username")}
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-slate-700">
              {t("login_password")}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={
              getClientDataMutation.isPending || loginMutation.isPending
            }
            className="w-full"
          >
            {getClientDataMutation.isPending || loginMutation.isPending
              ? t("login_signing_in")
              : t("login_submit")}
          </Button>
        </form>
        <StoreSelectDialog
          open={showRoleDialog && !!userResponse}
          onOpenChange={setShowRoleDialog}
          roles={roles}
          userName={`${userResponse?.userInfos?.fname ?? ""} ${
            userResponse?.userInfos?.lname ?? ""
          }`.trim()}
          onSelectRole={handleSelectRole}
        />
      </div>
    </main>
  );
}
