"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "../../lib/i18n";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import type { Supplier } from "./types";

type Props = {
  supplier: Supplier;
  refDate: string;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
};

const STATUS_COMPLETED = "Ολοκληρώθηκε";
const STATUS_PENDING = "Σε αναμονή";
const STATUS_PENDING_SHIPMENT = "Σε αναμονή αποστολής";

function getStatusStyle(descr: string | null | undefined): {
  text: string;
  bg: string;
  icon: React.ReactNode;
} {
  const d = descr ?? "";
  if (d === STATUS_COMPLETED) {
    return {
      text: "text-green-600",
      bg: "bg-green-200",
      icon: (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" aria-hidden />
      ),
    };
  }
  if (d === STATUS_PENDING) {
    return {
      text: "text-orange-600",
      bg: "bg-orange-200",
      icon: (
        <MoreHorizontal
          className="h-4 w-4 text-orange-500 shrink-0"
          aria-hidden
        />
      ),
    };
  }
  if (d === STATUS_PENDING_SHIPMENT) {
    return {
      text: "text-slate-500",
      bg: "bg-slate-200",
      icon: <Clock className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />,
    };
  }
  return {
    text: "text-red-600",
    bg: "bg-red-100",
    icon: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" aria-hidden />,
  };
}

export function SupplierTile({ supplier, refDate }: Props) {
  const { t } = useTranslation();
  const supplierHref = `/suppliers/${encodeURIComponent(
    supplier.supplierUID
  )}?refDate=${encodeURIComponent(refDate)}`;

  const statusDescr = supplier.basketIconStatusDescr ?? "";
  const statusStyle = getStatusStyle(statusDescr);
  const isPending = (statusDescr ?? "").includes(STATUS_PENDING);
  const actionLabel = isPending ? t("supplier_continue") : t("supplier_open");

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-app-card/95 shadow-sm">
      {/* Top: logo + title + next delivery */}
      <div className="flex items-start gap-3 p-4 pb-2">
        {supplier.logo && (
          <img
            src={supplier.logo}
            alt={supplier.title ?? ""}
            className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-contain"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate  font-bold uppercase tracking-wide text-slate-900">
            {supplier.title}
          </p>
          {supplier.nextAvailDeliveryText && (
            <p className="mt-0.5 text-sm text-slate-500">
              {t("suppliers_delivery")} {supplier.nextAvailDeliveryText}
            </p>
          )}
        </div>
      </div>

      {/* Middle: status + action button */}
      <div className="flex items-center gap-2 px-4 py-2">
        <span
          className={`inline-flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5  font-medium ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.icon}
          <span className="truncate">{statusDescr || "—"}</span>
        </span>
        <Link
          href={supplierHref}
          className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5  font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          {actionLabel}
        </Link>
      </div>

      {/* Bottom: order days */}
      {supplier.weekDeliveryDaysText && (
        <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2 justify-center">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className=" text-slate-600">
            {supplier.weekDeliveryDaysText}
          </span>
        </div>
      )}
    </div>
  );
}
