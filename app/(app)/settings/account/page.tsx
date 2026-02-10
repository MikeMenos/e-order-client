"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import type {
  MyProfileResponse,
  MyProfileUpdateRequest,
} from "@/lib/types/dashboard";
import { DetailSection } from "@/components/ui/detail-section";
import { DetailRow } from "@/components/ui/detail-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";

export default function AccountSettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const profileQuery = useQuery<MyProfileResponse>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const res = await api.get<MyProfileResponse>("/my-profile");
      return res.data;
    },
  });

  const user = profileQuery.data?.userInfos ?? null;

  const [form, setForm] = useState<MyProfileUpdateRequest>({
    email: "",
    fname: "",
    lname: "",
    mobile: "",
    newPassword1: "",
    newPassword2: "",
    profilePic: "",
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        email: user.email ?? "",
        fname: user.fname ?? "",
        lname: user.lname ?? "",
        mobile: user.mobile ?? "",
        profilePic: user.profilePic ?? "",
        newPassword1: "",
        newPassword2: "",
      }));
    }
  }, [user]);

  const updateMutation = useMutation<
    { statusCode?: number; message?: string; detailedMessage?: string },
    unknown,
    MyProfileUpdateRequest
  >({
    mutationFn: async (payload) => {
      const res = await api.post("/my-profile-update", payload);
      return res.data;
    },
    onSuccess: (data) => {
      const msg = (data.message ?? "").toString().trim();
      toast.success(msg || t("config_loading_users")); // reuse a generic success if message empty
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const handleChange = (field: keyof MyProfileUpdateRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const fullName =
    (user ? [user.fname, user.lname].filter(Boolean).join(" ") : "") ||
    t("settings_edit_account");

  return (
    <main className="pb-16 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <div className="my-4 rounded-xl border border-slate-200 bg-app-card/95 p-4 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
          {user?.username && (
            <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
          )}
        </div>

        {profileQuery.isLoading && (
          <p className="text-sm text-slate-500">
            {t("settings_account_loading")}
          </p>
        )}

        {profileQuery.error && (
          <p className="text-sm text-red-400">{t("settings_account_error")}</p>
        )}

        {!profileQuery.isLoading && !profileQuery.error && user && (
          <div className="space-y-4">
            <DetailSection title={t("settings_edit_account")}>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    {t("signup_email")}
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      {t("first_name")}
                    </label>
                    <Input
                      value={form.fname}
                      onChange={(e) => handleChange("fname", e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      {t("last_name")}
                    </label>
                    <Input
                      value={form.lname}
                      onChange={(e) => handleChange("lname", e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    {t("signup_phone")}
                  </label>
                  <Input
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    {t("login_password")}
                  </label>
                  <Input
                    type="password"
                    value={form.newPassword1}
                    onChange={(e) =>
                      handleChange("newPassword1", e.target.value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    {t("signup_password_confirm")}
                  </label>
                  <Input
                    type="password"
                    value={form.newPassword2}
                    onChange={(e) =>
                      handleChange("newPassword2", e.target.value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending
                      ? t("checkout_submitting")
                      : t("settings_save_account_settings")}
                  </Button>
                </div>
              </form>
            </DetailSection>
          </div>
        )}
      </div>
    </main>
  );
}
