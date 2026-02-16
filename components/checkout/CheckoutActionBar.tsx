"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export type CheckoutActionBarProps = {
  temporarySaveLabelKey: string;
  submitOrderLabelKey: string;
  onTemporarySave: () => void;
  onSubmitOrder: () => void;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
};

export function CheckoutActionBar({
  temporarySaveLabelKey,
  submitOrderLabelKey,
  onTemporarySave,
  onSubmitOrder,
  isSubmitting = false,
  isSubmitDisabled = false,
}: CheckoutActionBarProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t border-slate-200 bg-app-card/95 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur md:flex-row md:justify-center md:gap-4 md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:rounded-t-xl">
      <Button
        type="button"
        variant="outline"
        className="w-full md:w-auto md:min-w-[12rem] border-brand-400 text-brand-600 hover:bg-brand-50"
        onClick={onTemporarySave}
        disabled={isSubmitting}
      >
        {t(temporarySaveLabelKey)}
      </Button>
      <Button
        type="button"
        className="w-full md:w-auto md:min-w-[12rem]"
        onClick={onSubmitOrder}
        disabled={isSubmitting || isSubmitDisabled}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("checkout_submitting")}
          </>
        ) : (
          t(submitOrderLabelKey)
        )}
      </Button>
    </div>
  );
}
