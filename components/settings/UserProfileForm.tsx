"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StoreUser, UsersAddOrUpdateRequest } from "@/lib/types/users";

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

const EMPTY_FORM: UsersAddOrUpdateRequest = {
  username: "",
  email: "",
  fname: "",
  lname: "",
  mobile: "",
  profilePic: "",
  roleLevel: undefined,
  newPassword1: "",
  newPassword2: "",
};

const ROLE_LEVELS = [
  { value: 1, labelKey: "settings_user_type_admin" },
  { value: 2, labelKey: "settings_user_type_deputy" },
  { value: 3, labelKey: "settings_user_type_employee" },
] as const;

const PERMISSION_CODES = ["P1", "P2", "P3", "P4", "P5", "P6"] as const;

function getDefaultPolicies(
  t: (key: string) => string,
): { code: string; name: string; hasAccess: boolean }[] {
  return PERMISSION_CODES.map((code) => ({
    code,
    name: t(`settings_perm_${code}`),
    hasAccess: false,
  }));
}

function mergePoliciesWithDefaults(
  fromUser: { code: string; name: string; hasAccess: boolean }[] | undefined,
  t: (key: string) => string,
): { code: string; name: string; hasAccess: boolean }[] {
  if (fromUser && fromUser.length > 0) {
    const byCode = new Map(fromUser.map((p) => [p.code, p]));
    return PERMISSION_CODES.map((code) => {
      const existing = byCode.get(code);
      return existing
        ? { ...existing, name: existing.name || t(`settings_perm_${code}`) }
        : { code, name: t(`settings_perm_${code}`), hasAccess: false };
    });
  }
  return getDefaultPolicies(t);
}

function RoleLevelDropdown({
  value,
  onChange,
  disabled,
  t,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  disabled: boolean;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const selected = ROLE_LEVELS.find((r) => r.value === value);
  const label = selected
    ? t(selected.labelKey)
    : t("settings_user_type_placeholder");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="flex h-9 w-full justify-between border-slate-300 font-normal"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-(--radix-dropdown-menu-trigger-width)"
      >
        {ROLE_LEVELS.map((r) => (
          <DropdownMenuItem
            key={r.value}
            onClick={() => {
              onChange(r.value);
              setOpen(false);
            }}
          >
            {t(r.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type UserProfileFormProps = {
  mode: "add" | "edit" | "edit-form";
  user?: StoreUser | null;
  form: UsersAddOrUpdateRequest;
  onFormChange: (
    field: keyof UsersAddOrUpdateRequest,
    value:
      | string
      | number
      | undefined
      | { code: string; name: string; hasAccess: boolean }[],
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onEditClick?: () => void;
  onToggleActive?: () => void;
  isPending: boolean;
  appUserUID?: string | null;
};

export function UserProfileForm({
  mode,
  user,
  form,
  onFormChange,
  onSubmit,
  onCancel,
  onToggleActive,
  isPending,
  appUserUID,
}: UserProfileFormProps) {
  const { t } = useTranslation();

  if (mode === "add") {
    return (
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="block  font-medium text-slate-600">
            {t("login_username")}
          </label>
          <Input
            value={form.username}
            onChange={(e) => onFormChange("username", e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block  font-medium text-slate-600">
            {t("signup_email")}
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => onFormChange("email", e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="block  font-medium text-slate-600">
              {t("first_name")}
            </label>
            <Input
              value={form.fname}
              onChange={(e) => onFormChange("fname", e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1">
            <label className="block  font-medium text-slate-600">
              {t("last_name")}
            </label>
            <Input
              value={form.lname}
              onChange={(e) => onFormChange("lname", e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="block  font-medium text-slate-600">
            {t("signup_phone")}
          </label>
          <Input
            value={form.mobile}
            onChange={(e) => onFormChange("mobile", e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <label className="block font-medium text-slate-600">
            {t("settings_user_type_select")}
          </label>
          <RoleLevelDropdown
            value={form.roleLevel}
            onChange={(v) => {
              onFormChange("roleLevel", v);
              if (v === 3 && !form.accessPolicies?.length) {
                onFormChange("accessPolicies", getDefaultPolicies(t));
              }
            }}
            disabled={isPending}
            t={t}
          />
        </div>
        {form.roleLevel === 3 && (
          <div className="space-y-2">
            <label className="block font-medium text-slate-600">
              {t("settings_permissions")}
            </label>
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              {(form.accessPolicies ?? getDefaultPolicies(t)).map((p) => (
                <div
                  key={p.code}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-slate-700">{p.name}</span>
                  <Switch
                    checked={p.hasAccess}
                    onCheckedChange={(checked) => {
                      const next = (
                        form.accessPolicies ?? getDefaultPolicies(t)
                      ).map((x) =>
                        x.code === p.code ? { ...x, hasAccess: checked } : x,
                      );
                      onFormChange("accessPolicies", next);
                    }}
                    disabled={isPending}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-1">
          <label className="block font-medium text-slate-600">
            {t("login_password")}
          </label>
          <PasswordInput
            value={form.newPassword1}
            onChange={(e) => onFormChange("newPassword1", e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block font-medium text-slate-600">
            {t("signup_password_confirm")}
          </label>
          <PasswordInput
            value={form.newPassword2}
            onChange={(e) => onFormChange("newPassword2", e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {t("checkout_date_cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("checkout_submitting")
              : t("settings_save_account_settings")}
          </Button>
        </div>
      </form>
    );
  }

  if (!user) return null;

  if (mode === "edit-form") {
    return (
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <p className=" text-slate-600">
            <span className="font-medium">{t("login_username")}:</span>{" "}
            {user.username}
          </p>
        </div>
        <div className="space-y-1">
          <label className="block  font-medium text-slate-600">
            {t("signup_email")}
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => onFormChange("email", e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="block  font-medium text-slate-600">
              {t("first_name")}
            </label>
            <Input
              value={form.fname}
              onChange={(e) => onFormChange("fname", e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1">
            <label className="block  font-medium text-slate-600">
              {t("last_name")}
            </label>
            <Input
              value={form.lname}
              onChange={(e) => onFormChange("lname", e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="block  font-medium text-slate-600">
            {t("signup_phone")}
          </label>
          <Input
            value={form.mobile}
            onChange={(e) => onFormChange("mobile", e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <label className="block font-medium text-slate-600">
            {t("settings_user_type_select")}
          </label>
          <RoleLevelDropdown
            value={form.roleLevel}
            onChange={(v) => {
              onFormChange("roleLevel", v);
              if (v === 3 && !form.accessPolicies?.length) {
                onFormChange(
                  "accessPolicies",
                  mergePoliciesWithDefaults(user.storeAccess?.[0]?.policies, t),
                );
              }
            }}
            disabled={isPending}
            t={t}
          />
        </div>
        {form.roleLevel === 3 && (
          <div className="space-y-2">
            <label className="block font-medium text-slate-600">
              {t("settings_permissions")}
            </label>
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              {(
                form.accessPolicies ??
                mergePoliciesWithDefaults(user.storeAccess?.[0]?.policies, t)
              ).map((p) => (
                <div
                  key={p.code}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-slate-700">{p.name}</span>
                  <Switch
                    checked={p.hasAccess}
                    onCheckedChange={(checked) => {
                      const base =
                        form.accessPolicies ??
                        mergePoliciesWithDefaults(
                          user.storeAccess?.[0]?.policies,
                          t,
                        );
                      const next = base.map((x) =>
                        x.code === p.code ? { ...x, hasAccess: checked } : x,
                      );
                      onFormChange("accessPolicies", next);
                    }}
                    disabled={isPending}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-1">
          <label className="block font-medium text-slate-600">
            {t("login_password")}
          </label>
          <PasswordInput
            value={form.newPassword1}
            onChange={(e) => onFormChange("newPassword1", e.target.value)}
            disabled={isPending}
            placeholder={
              appUserUID ? t("settings_user_password_placeholder") : undefined
            }
            className="placeholder:text-sm"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {t("checkout_date_cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("checkout_submitting")
              : t("settings_save_account_settings")}
          </Button>
        </div>
      </form>
    );
  }

  const userTypeLabel = user.storeAccess?.[0]?.userType;
  const userTypeId = user.storeAccess?.[0]?.userTypeId;
  const policies = user.storeAccess?.[0]?.policies;

  return (
    <div className="space-y-2">
      <p className=" text-slate-600">
        <span className="font-medium">{t("login_username")}:</span>{" "}
        {user.username}
      </p>
      <p className=" text-slate-600">
        <span className="font-medium">{t("signup_email")}:</span> {user.email}
      </p>
      <p className=" text-slate-600">
        <span className="font-medium">{t("signup_phone")}:</span>{" "}
        {user.mobile || "—"}
      </p>
      {userTypeLabel && (
        <p className=" text-slate-600">
          <span className="font-medium">{t("settings_user_type")}:</span>{" "}
          {userTypeLabel}
        </p>
      )}
      <p className=" text-slate-600">
        <span className="font-medium">{t("settings_user_created")}:</span>{" "}
        {formatDate(user.dateCreated)}
      </p>
      {userTypeId === 3 && policies && policies.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="font-medium text-slate-600">
            {t("settings_permissions")}
          </p>
          <div className="space-y-1 rounded-lg border border-slate-200 p-3">
            {policies.map((p) => (
              <div
                key={p.code}
                className="flex items-center justify-between gap-3 text-slate-600"
              >
                <span>{p.name}</span>
                <span
                  className={
                    p.hasAccess
                      ? "text-green-600 font-medium"
                      : "text-slate-400"
                  }
                >
                  {p.hasAccess ? "✓" : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { EMPTY_FORM };
