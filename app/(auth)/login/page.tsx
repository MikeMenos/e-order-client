"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../stores/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);
  const setSelectedUser = useAuthStore((s) => s.setSelectedUser);
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
      const res = await api.post("Account/User_Login", payload);
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
        toast.success("Select a store to continue");
        return;
      }

      // Single store: log in directly
      setLoggedIn({
        isLoggedIn: true,
        isAddUser: false,
        users: data,
      });
      toast.success("Logged in");
      router.push("/dashboard");
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error("Login failed");
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-900">
      <div className="w-full max-w-sm space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate();
          }}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
        >
          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <div className="space-y-1">
            <label className="block text-sm text-slate-700">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-slate-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loginMutation.isPending} className="w-full">
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {showRoleDialog && userResponse && (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow">
            <h2 className="text-sm font-semibold text-slate-900">
              Select store
            </h2>
            <p className="text-xs text-slate-600">
              Your account has access to multiple stores. Choose one to
              continue.
            </p>
            <div className="max-h-64 space-y-2 overflow-auto">
              {roles.map((role: any, idx: number) => (
                <Button
                  key={idx}
                  onClick={() => {
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
                    const token = userResponse?.accessToken;
                    if (token && typeof document !== "undefined") {
                      document.cookie = `accessToken=${encodeURIComponent(
                        token,
                      )}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax`;
                    }
                    toast.success("Store selected");
                    router.push("/dashboard");
                  }}
                  variant="outline"
                  className="flex w-full flex-col items-start justify-start bg-slate-50 px-3 py-2 text-left text-sm hover:border-slate-400"
                >
                  <span className="font-medium text-slate-900">
                    {role?.store?.title ?? "Store"}
                  </span>
                  <span className="text-xs text-slate-600">
                    {role?.userType}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
