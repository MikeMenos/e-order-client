"use client";

import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export type CheckoutActionBarProps = {
  temporarySaveLabelKey: string;
  submitOrderLabelKey: string;
  onTemporarySave: () => void;
  onSubmitOrder: () => void;
};

export function CheckoutActionBar({
  temporarySaveLabelKey,
  submitOrderLabelKey,
  onTemporarySave,
  onSubmitOrder,
}: CheckoutActionBarProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t border-slate-200 bg-app-card/95 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur">
      <Button
        type="button"
        variant="outline"
        className="w-full border-brand-400 text-brand-600 hover:bg-brand-50"
        onClick={onTemporarySave}
      >
        {t(temporarySaveLabelKey)}
      </Button>
      <Button type="button" className="w-full" onClick={onSubmitOrder}>
        {t(submitOrderLabelKey)}
      </Button>
    </div>
  );
}
