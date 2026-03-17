"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type HideFromPendingConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isHiding?: boolean;
};

export function HideFromPendingConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isHiding = false,
}: HideFromPendingConfirmDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("orders_of_day_hide_confirm_title")}</DialogTitle>
          <DialogDescription>
            {t("orders_of_day_hide_confirm_description")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("checkout_date_cancel")}
          </Button>
          <Button
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleConfirm}
            disabled={isHiding}
          >
            {isHiding ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {t("checkout_removing")}
              </>
            ) : (
              t("orders_of_day_hide_confirm_button")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
