"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { MyProfileUpdateRequest } from "@/lib/types/dashboard";
import { useMyProfile, useMyProfileUpdate } from "@/hooks/useMyProfile";
import { useAuthStore } from "@/stores/auth";
import { DetailSection } from "@/components/ui/detail-section";
import { ClearableInput } from "@/components/ui/clearable-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { getApiErrorMessage } from "@/lib/api-error";

export default function AccountSettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const profileQuery = useMyProfile();
  const user = profileQuery.data?.userInfos ?? null;

  const updateMutation = useMyProfileUpdate({
    onSuccess: (data) => {
      const msg = (data.message ?? "").toString().trim();
      toast.success(msg || t("config_loading_users"));
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

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

  const handleChange = (field: keyof MyProfileUpdateRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const fullName = user
    ? [user.fname, user.lname].filter(Boolean).join(" ")
    : "";

  return (
    <main className="pb-16 text-slate-900 px-2">
      <div className="mx-auto max-w-2xl">
        <div className="my-3">
          <h1 className="text-xl font-bold text-slate-900 mt-2">{fullName}</h1>
          {user?.username && (
            <p className="mt-1 text-base text-slate-500">@{user.username}</p>
          )}
        </div>

        {profileQuery.isLoading && <Loading spinnerOnly />}

        {profileQuery.error && (
          <ErrorMessage>{t("settings_account_error")}</ErrorMessage>
        )}

        {!profileQuery.isLoading && !profileQuery.error && user && (
          <div className="space-y-4">
            <DetailSection title={t("settings_edit_account_button")}>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-1 mb-1">
                  <label className="block text-base font-medium text-slate-600">
                    {t("signup_email")}
                  </label>
                  <ClearableInput
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1 mb-1">
                    <label className="block text-base font-medium text-slate-600">
                      {t("first_name")}
                    </label>
                    <ClearableInput
                      value={form.fname}
                      onChange={(e) => handleChange("fname", e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                  <div className="space-y-1 mb-1">
                    <label className="block text-base font-medium text-slate-600">
                      {t("last_name")}
                    </label>
                    <ClearableInput
                      value={form.lname}
                      onChange={(e) => handleChange("lname", e.target.value)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </div>
                <div className="space-y-1 mb-1">
                  <label className="block text-base font-medium text-slate-600">
                    {t("signup_phone")}
                  </label>
                  <ClearableInput
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="space-y-1 mb-1">
                  <label className="block text-base font-medium text-slate-600">
                    {t("login_password")}
                  </label>
                  <PasswordInput
                    value={form.newPassword1}
                    onChange={(e) =>
                      handleChange("newPassword1", e.target.value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="space-y-1 mb-1">
                  <label className="block text-base font-medium text-slate-600">
                    {t("signup_password_confirm")}
                  </label>
                  <PasswordInput
                    value={form.newPassword2}
                    onChange={(e) =>
                      handleChange("newPassword2", e.target.value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="py-2">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending
                      ? t("checkout_submitting")
                      : t("settings_save_account_settings")}
                  </Button>
                </div>
              </form>
              <div className="pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => {
                    logout();
                    router.replace("/");
                  }}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-red-500 px-6 py-4 text-base font-medium shadow-sm transition hover:border-red-200 hover:bg-red-50 text-white hover:text-red-700 active:scale-[0.99]"
                  aria-label={t("logout")}
                >
                  <LogOut
                    className="h-5 w-5 shrink-0 text-white transition-colors group-hover:text-red-600"
                    aria-hidden
                  />
                  {t("logout")}
                </Button>
              </div>
            </DetailSection>
          </div>
        )}
      </div>
    </main>
  );
}
