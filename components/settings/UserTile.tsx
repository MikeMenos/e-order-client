"use client";

import { Eye, Pencil } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { StoreUser } from "@/lib/types/users";

type Props = {
  user: StoreUser;
  onView: () => void;
  onEdit: () => void;
  onToggleActive?: () => void;
  isTogglePending?: boolean;
};

export function UserTile({
  user,
  onView,
  onEdit,
  onToggleActive,
  isTogglePending = false,
}: Props) {
  const { t } = useTranslation();
  const fullName =
    [user.fname, user.lname].filter(Boolean).join(" ") ||
    user.username ||
    t("settings_manage_users_unknown");
  const userType = user.storeAccess?.[0]?.userType;
  const isActive = user.isActive ?? true;
  const username = user.username;
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md"
      aria-label={`${fullName}, ${isActive ? t("settings_user_active") : t("settings_user_inactive")}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-lg font-medium text-slate-900 truncate">
          {username}
        </span>
        <span className="text-lg font-medium text-slate-900 truncate">
          {fullName}
        </span>
        {userType && (
          <span className="font-semibold text-slate-600 truncate">
            {userType}
          </span>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {isActive ? t("settings_user_active") : t("settings_user_inactive")}
          </span>
          {onToggleActive && (
            <Switch
              checked={isActive}
              onCheckedChange={() => onToggleActive()}
              disabled={isTogglePending}
            />
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          aria-label={t("settings_user_view")}
        >
          <Eye className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={t("settings_user_edit")}
        >
          <Pencil className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
