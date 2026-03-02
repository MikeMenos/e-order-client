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

type SubmitOrderConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
};

export function SubmitOrderConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: SubmitOrderConfirmDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("checkout_submit_order_confirm_title")}</DialogTitle>
          <DialogDescription>
            {t("checkout_submit_order_confirm_description")}
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
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {t("checkout_submitting")}
              </>
            ) : (
              t("checkout_submit_order_confirm_button")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
