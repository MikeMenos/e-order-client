"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore, useEffectiveSelectedUser } from "@/stores/auth";
import { useUsersForStore, useUsersToggleActive } from "@/hooks/useUsers";
import { useUserProfile } from "@/hooks/useUsers";
import { getApiErrorMessage } from "@/lib/api-error";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UserPlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DetailSection } from "@/components/ui/detail-section";
import { Input } from "@/components/ui/input";
import type { StoreUser } from "@/lib/types/users";
import type { UsersAddOrUpdateRequest } from "@/lib/types/users";
import { useUsersAddOrUpdate } from "@/hooks/useUsers";
import { listVariants, listItemVariants } from "@/lib/motion";

function formatDate(iso: string | undefined) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function UserTile({ user, onClick }: { user: StoreUser; onClick: () => void }) {
  const { t } = useTranslation();
  const fullName =
    [user.fname, user.lname].filter(Boolean).join(" ") ||
    user.username ||
    t("settings_manage_users_unknown");
  const isActive = user.isActive ?? true;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md active:scale-[0.99] cursor-pointer"
      aria-label={`${fullName}, ${isActive ? t("settings_user_active") : t("settings_user_inactive")}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-medium text-slate-900 truncate">
          {fullName}
        </span>
        <span className="text-sm text-slate-500 truncate">
          {user.email || user.username}
        </span>
        <span
          className={`mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-800"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {isActive ? t("settings_user_active") : t("settings_user_inactive")}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
    </div>
  );
}

function UserProfileDialog({
  appUserUID,
  open,
  onOpenChange,
  onSaved,
  isAddMode,
}: {
  appUserUID: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  isAddMode?: boolean;
}) {
  const { t } = useTranslation();
  const profileQuery = useUserProfile(appUserUID);
  const user = profileQuery.data?.userProfile ?? null;
  const toggleMutation = useUsersToggleActive({
    onSuccess: () => {
      toast.success(t("settings_user_toggle_success"));
      profileQuery.refetch();
      onSaved?.();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("settings_user_toggle_error")));
    },
  });
  const addOrUpdateMutation = useUsersAddOrUpdate({
    onSuccess: (data) => {
      toast.success(data?.message || t("config_loading_users"));
      profileQuery.refetch();
      onSaved?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UsersAddOrUpdateRequest>({
    username: "",
    email: "",
    fname: "",
    lname: "",
    mobile: "",
    profilePic: "",
    newPassword1: "",
    newPassword2: "",
  });

  const handleToggle = useCallback(() => {
    if (!appUserUID) return;
    toggleMutation.mutate(appUserUID);
  }, [appUserUID, toggleMutation]);

  const handleChange = (
    field: keyof UsersAddOrUpdateRequest,
    value: string | undefined,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addOrUpdateMutation.mutate({
      ...form,
      appUserUID: appUserUID || undefined,
    });
  };

  const fullName = user
    ? [user.fname, user.lname].filter(Boolean).join(" ") || user.username
    : t("settings_manage_users_unknown");

  if (!open) return null;

  const displayTitle = isAddMode ? t("settings_create_user") : fullName;
  const [addForm, setAddForm] = useState<UsersAddOrUpdateRequest>({
    username: "",
    email: "",
    fname: "",
    lname: "",
    mobile: "",
    profilePic: "",
    newPassword1: "",
    newPassword2: "",
  });

  const handleAddSave = (e: React.FormEvent) => {
    e.preventDefault();
    addOrUpdateMutation.mutate(addForm, {
      onSuccess: (data) => {
        toast.success(data?.message || t("config_loading_users"));
        onSaved?.();
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, t("basket_error")));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto gap-4">
        <DialogHeader>
          <DialogTitle>{displayTitle}</DialogTitle>
        </DialogHeader>

        {isAddMode ? (
          <DetailSection title={t("settings_create_user")}>
            <form className="space-y-3" onSubmit={handleAddSave}>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-600">
                  {t("login_username")}
                </label>
                <Input
                  value={addForm.username}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, username: e.target.value }))
                  }
                  disabled={addOrUpdateMutation.isPending}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-600">
                  {t("signup_email")}
                </label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, email: e.target.value }))
                  }
                  disabled={addOrUpdateMutation.isPending}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-600">
                    {t("first_name")}
                  </label>
                  <Input
                    value={addForm.fname}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, fname: e.target.value }))
                    }
                    disabled={addOrUpdateMutation.isPending}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-600">
                    {t("last_name")}
                  </label>
                  <Input
                    value={addForm.lname}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, lname: e.target.value }))
                    }
                    disabled={addOrUpdateMutation.isPending}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-600">
                  {t("signup_phone")}
                </label>
                <Input
                  value={addForm.mobile}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, mobile: e.target.value }))
                  }
                  disabled={addOrUpdateMutation.isPending}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-600">
                  {t("login_password")}
                </label>
                <Input
                  type="password"
                  value={addForm.newPassword1}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, newPassword1: e.target.value }))
                  }
                  disabled={addOrUpdateMutation.isPending}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-600">
                  {t("signup_password_confirm")}
                </label>
                <Input
                  type="password"
                  value={addForm.newPassword2}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, newPassword2: e.target.value }))
                  }
                  disabled={addOrUpdateMutation.isPending}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={addOrUpdateMutation.isPending}
                >
                  {t("checkout_date_cancel")}
                </Button>
                <Button type="submit" disabled={addOrUpdateMutation.isPending}>
                  {addOrUpdateMutation.isPending
                    ? t("checkout_submitting")
                    : t("settings_save_account_settings")}
                </Button>
              </div>
            </form>
          </DetailSection>
        ) : (
          <>
            {profileQuery.isLoading && <Loading spinnerOnly />}

            {profileQuery.error && (
              <p className="text-base text-red-400">
                {t("settings_manage_users_error")}
              </p>
            )}

            {!profileQuery.isLoading && !profileQuery.error && user && (
              <div className="space-y-4">
                <DetailSection title={t("settings_edit_account")}>
                  {isEditing ? (
                    <form className="space-y-3" onSubmit={handleSave}>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">
                          {t("login_username")}
                        </label>
                        <Input
                          value={form.username}
                          onChange={(e) =>
                            handleChange("username", e.target.value)
                          }
                          disabled={addOrUpdateMutation.isPending}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">
                          {t("signup_email")}
                        </label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                          disabled={addOrUpdateMutation.isPending}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-slate-600">
                            {t("first_name")}
                          </label>
                          <Input
                            value={form.fname}
                            onChange={(e) =>
                              handleChange("fname", e.target.value)
                            }
                            disabled={addOrUpdateMutation.isPending}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-slate-600">
                            {t("last_name")}
                          </label>
                          <Input
                            value={form.lname}
                            onChange={(e) =>
                              handleChange("lname", e.target.value)
                            }
                            disabled={addOrUpdateMutation.isPending}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">
                          {t("signup_phone")}
                        </label>
                        <Input
                          value={form.mobile}
                          onChange={(e) =>
                            handleChange("mobile", e.target.value)
                          }
                          disabled={addOrUpdateMutation.isPending}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">
                          {t("login_password")}
                        </label>
                        <Input
                          type="password"
                          value={form.newPassword1}
                          onChange={(e) =>
                            handleChange("newPassword1", e.target.value)
                          }
                          disabled={addOrUpdateMutation.isPending}
                          placeholder={
                            appUserUID
                              ? t("settings_user_password_placeholder")
                              : undefined
                          }
                        />
                      </div>
                      {!appUserUID && (
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-slate-600">
                            {t("signup_password_confirm")}
                          </label>
                          <Input
                            type="password"
                            value={form.newPassword2}
                            onChange={(e) =>
                              handleChange("newPassword2", e.target.value)
                            }
                            disabled={addOrUpdateMutation.isPending}
                          />
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={addOrUpdateMutation.isPending}
                        >
                          {t("checkout_date_cancel")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={addOrUpdateMutation.isPending}
                        >
                          {addOrUpdateMutation.isPending
                            ? t("checkout_submitting")
                            : t("settings_save_account_settings")}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">
                          {t("login_username")}:
                        </span>{" "}
                        {user.username}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">
                          {t("signup_email")}:
                        </span>{" "}
                        {user.email}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">
                          {t("signup_phone")}:
                        </span>{" "}
                        {user.mobile || "—"}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">
                          {t("settings_user_created")}:
                        </span>{" "}
                        {formatDate(user.dateCreated)}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setForm({
                              username: user.username ?? "",
                              email: user.email ?? "",
                              fname: user.fname ?? "",
                              lname: user.lname ?? "",
                              mobile: user.mobile ?? "",
                              profilePic: user.profilePic ?? "",
                              newPassword1: "",
                              newPassword2: "",
                            });
                            setIsEditing(true);
                          }}
                        >
                          {t("settings_user_edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleToggle}
                          disabled={toggleMutation.isPending}
                        >
                          {toggleMutation.isPending
                            ? t("checkout_submitting")
                            : user.isActive
                              ? t("settings_user_deactivate")
                              : t("settings_user_activate")}
                        </Button>
                      </div>
                    </div>
                  )}
                </DetailSection>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ManageUsersPage() {
  const { t } = useTranslation();
  const users = useAuthStore((s) => s.users);
  const effectiveUser = useEffectiveSelectedUser();
  const selectedStoreUID = useAuthStore((s) => s.selectedStoreUID);

  const storeUID = useMemo(() => {
    return (
      selectedStoreUID ||
      effectiveUser?.store?.storeUID ||
      users?.role?.store?.storeUID ||
      null
    );
  }, [selectedStoreUID, users, effectiveUser]);

  const usersQuery = useUsersForStore(storeUID);
  const listUsers = usersQuery.data?.listUsers ?? [];
  const [selectedUserUID, setSelectedUserUID] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const handleUserClick = useCallback((user: StoreUser) => {
    setSelectedUserUID(user.appUserUID);
    setProfileOpen(true);
  }, []);

  const handleAddUser = useCallback(() => {
    setSelectedUserUID(null);
    setAddUserOpen(true);
  }, []);

  return (
    <main className="text-slate-900 px-3">
      <div className="mx-auto max-w-2xl p-4">
        <h1 className="text-xl font-bold text-slate-900 mt-2 mb-4 text-center">
          {t("settings_manage_users")}
        </h1>

        {/* <div className="mb-4 flex justify-end">
          <Button variant="default" onClick={handleAddUser} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t("settings_create_user")}
          </Button>
        </div> */}

        {usersQuery.isLoading && <Loading spinnerOnly />}

        {usersQuery.error && (
          <p className="text-base text-red-400">
            {getApiErrorMessage(
              usersQuery.error as Error,
              t("config_error_users"),
            )}
          </p>
        )}

        {!usersQuery.isLoading && !usersQuery.error && (
          <>
            {listUsers.length === 0 ? (
              <p className="text-base text-slate-400 rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 inline-block">
                {t("config_empty_users")}
              </p>
            ) : (
              <motion.div
                className="space-y-3 pb-8"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {listUsers.map((u: StoreUser) => (
                  <motion.div key={u.appUserUID} variants={listItemVariants}>
                    <UserTile user={u} onClick={() => handleUserClick(u)} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      <UserProfileDialog
        appUserUID={selectedUserUID}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onSaved={() => usersQuery.refetch()}
      />

      <UserProfileDialog
        appUserUID={null}
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSaved={() => usersQuery.refetch()}
        isAddMode
      />
    </main>
  );
}
