"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone } from "lucide-react";
import type { IStoreInfo } from "@/lib/ergastirio-interfaces";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface StoreCardProps {
  data: IStoreInfo;
  isPending: boolean;
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) {
  const v = (value ?? "").trim();
  const isEmpty = v.length === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 shadow-sm bg-app-card/80 text-slate-900",
        isEmpty && "opacity-70",
      )}
    >
      <span className="shrink-0 text-slate-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p
          className={cn(
            "truncate text-base font-semibold text-slate-900",
            isEmpty && "font-medium text-slate-500",
          )}
        >
          {isEmpty ? "—" : v}
        </p>
      </div>
    </div>
  );
}

export default function ErgastirioStoreCard({
  data,
  isPending,
}: StoreCardProps) {
  const isCentral = data.BRANCH === "0";
  const { t } = useTranslation();
  const branchTitle = isCentral
    ? t("erg_central_branch")
    : `${t("erg_branch")} ${data.BRANCH}`;

  const addressLine = [data.ADDRESS, data.DISTRICT, data.ZIP]
    .filter(Boolean)
    .join(", ");
  const fullAddress = addressLine || undefined;

  const phone = (data.PHONE01 ?? "").trim() || undefined;

  return (
    <Card
      className={cn(
        "group overflow-hidden shadow-sm border-slate-200 bg-app-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md",
        isPending && "opacity-60 pointer-events-none",
      )}
    >
      <CardContent className="p-0 sm:p-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="inline-flex items-center rounded-2xl bg-brand-500 px-2 py-1 text-base font-semibold leading-none text-white tracking-tight">
                  {branchTitle}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="my-4 border-t border-dashed border-slate-200" />
        <div className="flex flex-col gap-3">
          <InfoItem
            label={t("erg_address")}
            value={fullAddress}
            icon={<MapPin className="h-4 w-4 text-slate-400" />}
          />
          <InfoItem
            label={t("erg_phone")}
            value={phone}
            icon={<Phone className="h-4 w-4 text-slate-400" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
