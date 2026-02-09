"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingCart } from "lucide-react";
import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { IProductItem, IStoreInfo } from "@/lib/ergastirio-interfaces";
import { useTranslation } from "@/lib/i18n";

const PROGRAMMATISMOS_MAP: Record<string, number> = {
  ΚΥΡ: 0,
  ΔΕΥ: 1,
  ΤΡΙ: 2,
  ΤΕΤ: 3,
  ΠΕΜ: 4,
  ΠΑΡ: 5,
  ΣΑΒ: 6,
};

function parseProgrammatismos(s: string): {
  allowed: Set<number>;
  label: string;
} {
  const allowed = new Set<number>();
  const parts = s
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean);
  for (const p of parts) {
    const n = PROGRAMMATISMOS_MAP[p];
    if (n !== undefined) allowed.add(n);
  }
  return { allowed, label: parts.join(", ") };
}

interface ErgastirioCartTotalsProps {
  items?: IProductItem[];
  onSendOrder?: (meta: { comments: string; delivDate: string }) => void;
  comments: string;
  setComments: (comments: string) => void;
  delivDate: string;
  isPending: boolean;
  setDelivDate: (date: string) => void;
  currentBranch?: IStoreInfo | null;
}

export function ErgastirioCartTotals({
  items,
  onSendOrder,
  comments,
  setComments,
  delivDate,
  setDelivDate,
  isPending,
  currentBranch,
}: ErgastirioCartTotalsProps) {
  const { t } = useTranslation();
  const programmatismos = useMemo(() => {
    if (
      currentBranch?.GROUP_CHAIN !== "L'ARTIGIANO" ||
      !currentBranch?.PROGRAMMATISMOS
    )
      return null;
    return parseProgrammatismos(currentBranch.PROGRAMMATISMOS);
  }, [currentBranch]);

  const disabledMatchers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchers: Array<{ before: Date } | { dayOfWeek: number[] }> = [
      { before: today },
    ];
    if (programmatismos) {
      const disabledWeekdays = [0, 1, 2, 3, 4, 5, 6].filter(
        (d) => !programmatismos.allowed.has(d),
      );
      if (disabledWeekdays.length > 0) {
        matchers.push({ dayOfWeek: disabledWeekdays });
      }
    }
    return matchers;
  }, [programmatismos]);

  const selectedDate = useMemo(() => {
    if (!delivDate) return undefined;
    const d = new Date(delivDate + "T12:00:00");
    return Number.isNaN(d.getTime()) ? undefined : d;
  }, [delivDate]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) {
      setDelivDate("");
      return;
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    setDelivDate(`${y}-${m}-${d}`);
  };

  const handleSendOrderClick = () => {
    if (onSendOrder && items) {
      onSendOrder({ comments, delivDate });
    }
  };

  return (
    <Card className="border-0 shadow-none rounded-2xl bg-transparent">
      <CardContent className="pb-4 pt-4 space-y-4 text-sm p-0">
        <div className="space-y-1 text-center">
          <Label className="text-slate-500">{t("erg_delivery_date")}</Label>
          {programmatismos && (
            <p className="text-slate-500">
              {t("erg_available_days")}{" "}
              <span className="font-bold">{programmatismos.label}</span>
            </p>
          )}
          <div className="border border-brand-200 bg-white rounded-xl overflow-visible pl-2 pr-8 py-2 min-w-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              disabled={disabledMatchers}
              className="ergastirio-delivery-calendar border-0 rounded-none shadow-none md:h-fit h-[45vh] w-full min-w-[280px]"
            />
          </div>
        </div>
        <div className="px-3 space-y-1">
          <Label className="text-xs text-slate-500">
            {t("erg_order_comments")}
          </Label>
          <Textarea
            className="bg-white border-slate-200"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
        </div>
        <div className="pt-4 p-4">
          <Button
            className="w-full gap-2 bg-brand-500 hover:bg-brand-600"
            size="lg"
            onClick={handleSendOrderClick}
            disabled={items?.length === 0 || !delivDate || isPending}
          >
            {isPending ? (
              <Spinner size={20} className="shrink-0" />
            ) : (
              <ShoppingCart className="h-4 w-4 shrink-0" />
            )}
            {isPending ? t("erg_sending") : t("erg_send_order")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
