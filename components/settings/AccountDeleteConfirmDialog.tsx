"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AccountDeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function AccountDeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: AccountDeleteConfirmDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("account_delete_confirm_title")}</DialogTitle>
          <DialogDescription>
            {t("account_delete_confirm_description")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("checkout_date_cancel")}
          </Button>
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                {t("checkout_submitting")}
              </>
            ) : (
              t("account_delete_button")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
