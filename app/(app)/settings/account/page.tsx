"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { MyProfileUpdateRequest } from "@/lib/types/dashboard";
import {
  useDeleteMyAccount,
  useMyProfile,
  useMyProfileUpdate,
} from "@/hooks/useMyProfile";
import { useAuthStore } from "@/stores/auth";
import { DetailSection } from "@/components/ui/detail-section";
import { ClearableInput } from "@/components/ui/clearable-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { AccountDeleteConfirmDialog } from "@/components/settings/AccountDeleteConfirmDialog";
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

  const deleteAccountMutation = useDeleteMyAccount({
    onSuccess: (data) => {
      const msg = (data.message ?? "").toString().trim();
      toast.success(msg || t("account_delete_success"));
      logout();
      router.replace("/");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("account_delete_error")));
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const fullName = user
    ? [user.fname, user.lname].filter(Boolean).join(" ")
    : "";

  return (
    <main className="safe-area-insets pb-16 text-slate-900 px-4 md:px-6">
      <div className="mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="my-4 md:my-6 px-2">
          <h1 className="mt-2 text-xl font-bold text-slate-900 md:text-2xl">
            {fullName}
          </h1>
          {user?.username && (
            <p className="mt-1 text-base text-slate-500 md:text-lg">
              @{user.username}
            </p>
          )}
        </div>

        {profileQuery.isLoading && <Loading spinnerOnly />}

        {profileQuery.error && (
          <ErrorMessage>{t("settings_account_error")}</ErrorMessage>
        )}

        {!profileQuery.isLoading && !profileQuery.error && user && (
          <div className="space-y-4 px-2">
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
                <div className="py-3 md:py-4">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="min-h-11 px-8"
                  >
                    {updateMutation.isPending
                      ? t("checkout_submitting")
                      : t("settings_save_account_settings")}
                  </Button>
                </div>
              </form>
              <div className="border-t border-slate-100 pt-5 md:pt-6 space-y-3">
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                  {t("account_delete_section_hint")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={
                    updateMutation.isPending || deleteAccountMutation.isPending
                  }
                  className="min-h-11 w-full border-red-200 text-red-700 hover:bg-red-50"
                >
                  {deleteAccountMutation.isPending
                    ? t("checkout_submitting")
                    : t("account_delete_button")}
                </Button>
                <AccountDeleteConfirmDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                  onConfirm={handleDeleteAccount}
                  isDeleting={deleteAccountMutation.isPending}
                />
                <Button
                  type="button"
                  onClick={() => {
                    logout();
                    router.replace("/");
                  }}
                  className="group flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-slate-200/80 bg-red-500 px-6 py-4 text-base font-medium text-white shadow-sm transition hover:bg-red-600 hover:text-white active:scale-[0.99]"
                  aria-label={t("logout")}
                >
                  <LogOut className="h-5 w-5 shrink-0 text-white" aria-hidden />
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
