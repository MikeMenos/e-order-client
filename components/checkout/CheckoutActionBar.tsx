"use client";

import { Button } from "@/components/ui/button";

export type CheckoutActionBarProps = {
  temporarySaveLabel: string;
  submitOrderLabel: string;
  onTemporarySave: () => void;
  onSubmitOrder: () => void;
};

export function CheckoutActionBar({
  temporarySaveLabel,
  submitOrderLabel,
  onTemporarySave,
  onSubmitOrder,
}: CheckoutActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t border-slate-200 bg-app-card/95 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur">
      <Button
        type="button"
        variant="outline"
        className="w-full border-brand-400 text-brand-600 hover:bg-brand-50"
        onClick={onTemporarySave}
      >
        {temporarySaveLabel}
      </Button>
      <Button type="button" className="w-full" onClick={onSubmitOrder}>
        {submitOrderLabel}
      </Button>
    </div>
  );
}
