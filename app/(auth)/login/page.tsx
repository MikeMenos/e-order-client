"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../stores/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { StoreSelectDialog } from "../../../components/auth/StoreSelectDialog";
import { useTranslation } from "../../../lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { users } = useAuthStore();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);
  const setSelectedUser = useAuthStore((s) => s.setSelectedUser);
  const setStoreAccessToken = useAuthStore((s) => s.setStoreAccessToken);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [userResponse, setUserResponse] = useState<any | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

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
      if (data?.statusCode !== 200) {
        toast.error(data?.message ?? "Login failed");
        return;
      }

      const token = data.accessToken ?? null;
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
      toast.error(t("login_toast_error"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
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
    <main className="flex min-h-screen flex-col items-center bg-slate-100 pt-8 text-slate-900">
      <div className="mb-6 flex w-full max-w-sm items-center justify-between px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo.png"
          alt="E-Order"
          className="h-12 w-12 rounded-lg object-contain"
        />
        <Link
          href="/"
          className="rounded px-2 py-1 text-sm hover:bg-slate-200 transition-colors"
        >
          {t("nav_back_home")}
        </Link>
      </div>
      <div className="w-full max-w-sm space-y-6 px-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
        >
          <h1 className="text-xl font-semibold text-slate-900">
            {t("login_title")}
          </h1>
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
            disabled={loginMutation.isPending}
            className="w-full"
          >
            {loginMutation.isPending ? "Signing in..." : t("login_submit")}
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
