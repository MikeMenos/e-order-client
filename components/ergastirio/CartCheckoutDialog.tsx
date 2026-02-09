"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ErgastirioHeading from "./Heading";
import { ArrowRight, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface ErgastirioCartCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  headingTitle?: string;
  showVatPricing?: boolean;
  sumAmnt?: string;
  isPricingLoading?: boolean;
}

export function ErgastirioCartCheckoutDialog({
  open,
  onOpenChange,
  children,
  headingTitle,
  showVatPricing,
  sumAmnt,
  isPricingLoading,
}: ErgastirioCartCheckoutDialogProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="fixed left-0 right-0 z-40 p-4 bg-app-bg/95 backdrop-blur border-t border-slate-200 md:flex md:justify-center bottom-16 md:bottom-0 px-2">
        <Button
          className="w-full md:max-w-sm md:min-w-[280px] h-12 text-base bg-brand-500 hover:bg-brand-600"
          onClick={() => onOpenChange(true)}
        >
          {headingTitle ?? t("erg_order_details_and_checkout")}{" "}
          <ArrowRight className="size-4" />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] max-w-lg bg-app-card border-slate-200 overflow-y-auto">
          <div className="relative pr-10">
            <ErgastirioHeading
              title={headingTitle ?? t("erg_order_details")}
              showVatPricing={showVatPricing}
              sumAmnt={sumAmnt}
              isPricingLoading={isPricingLoading}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("erg_close")}
              className="absolute top-0 right-0 text-slate-700"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-5" />
            </Button>
          </div>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
