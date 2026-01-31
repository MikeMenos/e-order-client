import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useTranslation } from "../../lib/i18n";

type StoreRole = any;

type StoreSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: StoreRole[];
  userName?: string;
  onSelectRole: (role: StoreRole) => void;
};

export function StoreSelectDialog({
  open,
  onOpenChange,
  roles,
  userName,
  onSelectRole,
}: StoreSelectDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm flex max-h-[85vh] flex-col gap-4">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DialogTitle>{t("store_select_title")}</DialogTitle>
              <DialogDescription>
                {t("store_select_description")}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("store_select_close")}
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 shrink-0 rounded-full"
            >
              ×
            </Button>
          </div>
        </DialogHeader>
        {userName && (
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {userName}
          </div>
        )}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {roles.map((role: StoreRole, idx: number) => (
            <Button
              key={idx}
              type="button"
              onClick={() => onSelectRole(role)}
              variant="outline"
              className="h-fit flex w-full flex-col items-start rounded-xl border-slate-200 bg-white px-3 py-2.5 text-left text-sm shadow-sm hover:border-brand-400 hover:bg-brand-50/80"
            >
              <span className="block font-medium text-slate-900">
                {role?.store?.title ?? t("store_select_store_fallback")}
              </span>
              <span className="block text-sm text-slate-600">
                {role?.userType}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
