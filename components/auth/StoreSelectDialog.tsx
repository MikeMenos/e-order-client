import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useTranslation } from "../../lib/i18n";
import { listVariants, listItemVariants } from "../../lib/motion";

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
      <DialogContent className="max-w-sm flex max-h-[85vh] flex-col gap-4 bg-app-card border-slate-200/80">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
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
              className="h-8 w-8 shrink-0 rounded-full text-3xl text-slate-500 hover:text-slate-700"
            >
              ×
            </Button>
          </div>
        </DialogHeader>
        <motion.div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto -mx-1 px-1"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {roles.map((role: StoreRole, idx: number) => (
            <motion.div key={idx} variants={listItemVariants}>
              <Button
                type="button"
                onClick={() => onSelectRole(role)}
                variant="outline"
                className="h-fit flex w-full flex-col items-start rounded-xl border-slate-200 bg-white px-3 py-2.5 text-left text-base shadow-sm hover:border-brand-400 hover:bg-brand-50/80"
              >
                <span className="block font-medium text-slate-900">
                  {role?.store?.title ?? t("store_select_store_fallback")}
                </span>
                <span className="block text-base text-slate-600">
                  {role?.userType}
                </span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
