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

type DeleteBasketConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeleteBasketConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteBasketConfirmDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("checkout_delete_basket_confirm_title")}</DialogTitle>
          <DialogDescription>
            {t("checkout_delete_basket_confirm_description")}
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
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {t("checkout_removing")}
              </>
            ) : (
              t("checkout_delete_basket_confirm_button")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
