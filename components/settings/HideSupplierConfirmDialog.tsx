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

type HideSupplierConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isHiding?: boolean;
};

export function HideSupplierConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isHiding = false,
}: HideSupplierConfirmDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {t("settings_hide_supplier_confirm_title")}
          </DialogTitle>
          <DialogDescription>
            {t("settings_hide_supplier_confirm_description")}
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
            disabled={isHiding}
          >
            {isHiding ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {t("checkout_removing")}
              </>
            ) : (
              t("settings_hide_supplier")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
