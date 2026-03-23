"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { getApiErrorMessage } from "@/lib/api-error";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Loading from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import {
  useUserProfile,
  useUsersToggleActive,
  useUsersAddOrUpdate,
} from "@/hooks/useUsers";
import { UserProfileForm, EMPTY_FORM } from "./UserProfileForm";
import type { UsersAddOrUpdateRequest } from "@/lib/types/users";

type Props = {
  appUserUID: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  isAddMode?: boolean;
  initialEdit?: boolean;
};

export function UserProfileDialog({
  appUserUID,
  open,
  onOpenChange,
  onSaved,
  isAddMode = false,
  initialEdit = false,
}: Props) {
  const { t } = useTranslation();
  const profileQuery = useUserProfile(isAddMode ? null : appUserUID);
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
  const [form, setForm] = useState<UsersAddOrUpdateRequest>({ ...EMPTY_FORM });
  const [addForm, setAddForm] = useState<UsersAddOrUpdateRequest>({
    ...EMPTY_FORM,
  });

  useEffect(() => {
    if (user && !isAddMode) {
      const roleLevel = user.storeAccess?.[0]?.userTypeId;
      const policies = user.storeAccess?.[0]?.policies;
      setForm({
        username: user.username ?? "",
        email: user.email ?? "",
        fname: user.fname ?? "",
        lname: user.lname ?? "",
        mobile: user.mobile ?? "",
        profilePic: user.profilePic ?? "",
        roleLevel: typeof roleLevel === "number" ? roleLevel : undefined,
        accessPolicies:
          roleLevel === 3 && policies?.length ? policies : undefined,
        newPassword1: "",
        newPassword2: "",
      });
      if (initialEdit) setIsEditing(true);
    }
  }, [user, isAddMode, initialEdit]);

  const handleToggle = useCallback(() => {
    if (!appUserUID) return;
    toggleMutation.mutate(appUserUID);
  }, [appUserUID, toggleMutation]);

  const handleFormChange = useCallback(
    (
      field: keyof UsersAddOrUpdateRequest,
      value:
        | string
        | number
        | undefined
        | { code: string; name: string; hasAccess: boolean }[],
    ) => {
      const update = { [field]: value };
      if (isAddMode) {
        setAddForm((p) => ({ ...p, ...update }));
      } else {
        setForm((p) => ({ ...p, ...update }));
      }
    },
    [isAddMode],
  );

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const source = isAddMode
        ? addForm
        : { ...form, appUserUID: appUserUID || undefined };
      const roleLevel = source.roleLevel;
      const data: UsersAddOrUpdateRequest = {
        ...source,
        appUserUID: isAddMode ? null : appUserUID || undefined,
      };
      if (roleLevel === 3) {
        data.accessPolicies = source.accessPolicies ?? [];
      } else {
        delete (data as Record<string, unknown>).accessPolicies;
      }
      addOrUpdateMutation.mutate(data);
    },
    [isAddMode, addForm, form, appUserUID, addOrUpdateMutation],
  );

  const handleEditClick = useCallback(() => {
    if (user) {
      const roleLevel = user.storeAccess?.[0]?.userTypeId;
      const policies = user.storeAccess?.[0]?.policies;
      setForm({
        username: user.username ?? "",
        email: user.email ?? "",
        fname: user.fname ?? "",
        lname: user.lname ?? "",
        mobile: user.mobile ?? "",
        profilePic: user.profilePic ?? "",
        roleLevel: typeof roleLevel === "number" ? roleLevel : undefined,
        accessPolicies:
          roleLevel === 3 && policies?.length ? policies : undefined,
        newPassword1: "",
        newPassword2: "",
      });
      setIsEditing(true);
    }
  }, [user]);

  const fullName = user
    ? [user.fname, user.lname].filter(Boolean).join(" ") || user.username
    : t("settings_manage_users_unknown");

  const displayTitle = isAddMode ? t("settings_create_user") : fullName;
  const isPending = addOrUpdateMutation.isPending || toggleMutation.isPending;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setIsEditing(false);
        setForm({ ...EMPTY_FORM });
        setAddForm({ ...EMPTY_FORM });
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto gap-4">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>{displayTitle}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={() => handleOpenChange(false)}
              aria-label={t("store_select_close")}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        {isAddMode ? (
          <UserProfileForm
            mode="add"
            form={addForm}
            onFormChange={handleFormChange}
            onSubmit={handleSave}
            onCancel={() => handleOpenChange(false)}
            isPending={isPending}
          />
        ) : (
          <>
            {profileQuery.isLoading && <Loading spinnerOnly />}

            {profileQuery.error && (
              <ErrorMessage>{t("settings_manage_users_error")}</ErrorMessage>
            )}

            {!profileQuery.isLoading && !profileQuery.error && user && (
              <div className="space-y-3">
                <UserProfileForm
                  mode={isEditing ? "edit-form" : "edit"}
                  user={user}
                  form={form}
                  onFormChange={handleFormChange}
                  onSubmit={handleSave}
                  onCancel={() => handleOpenChange(false)}
                  onEditClick={handleEditClick}
                  onToggleActive={handleToggle}
                  isPending={isPending}
                  appUserUID={appUserUID}
                />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
