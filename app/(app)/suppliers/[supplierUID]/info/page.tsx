"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Pencil, Loader2 } from "lucide-react";
import { useSupplierBasicInfos } from "@/hooks/useDashboardData";
import { usePersonalizedTextsUpdate } from "@/hooks/usePersonalizedTextsUpdate";
import { useTranslation } from "@/lib/i18n";
import { getApiErrorMessage } from "@/lib/api-error";
import { DetailSection } from "@/components/ui/detail-section";
import { DetailRow } from "@/components/ui/detail-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupplierInfoPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID;
  const queryClient = useQueryClient();

  const basicInfoQuery = useSupplierBasicInfos(supplierUID, !!supplierUID);
  const supplier =
    basicInfoQuery.data?.supplier ??
    basicInfoQuery.data?.suppliers?.[0] ??
    null;

  const displayName =
    supplier?.customTitle?.trim() || supplier?.originalTitle?.trim() || "";

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editCustomTitle, setEditCustomTitle] = useState("");

  const personalizedUpdate = usePersonalizedTextsUpdate({
    supplierUID: supplierUID ?? undefined,
    onSuccess: (data) => {
      const msg = data?.message?.trim();
      if (msg) toast.success(msg);
      void queryClient.invalidateQueries({
        queryKey: ["supplier-basic-infos", supplierUID],
      });
      setIsEditingTitle(false);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const startEditingTitle = () => {
    setEditCustomTitle(supplier?.customTitle?.trim() ?? "");
    setIsEditingTitle(true);
  };

  const saveCustomTitle = () => {
    if (!supplierUID) return;
    personalizedUpdate.mutate({
      productUID: "",
      supplierUID,
      erpCatUID: "",
      displayText: editCustomTitle.trim(),
      displayText2: "",
      displayText3: "",
      personalNotes: "",
    });
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditCustomTitle("");
  };

  return (
    <main className=" text-slate-900 px-3">
      <div className="mx-auto max-w-2xl">
        <div className="my-4 flex items-center justify-between gap-3 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 mt-2 min-w-0">
            {displayName || t("common_supplier")}
          </h1>
          {supplier && !isEditingTitle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={startEditingTitle}
              className="shrink-0 gap-1.5 text-slate-600 hover:text-slate-900"
              aria-label={t("product_edit_title")}
            >
              <Pencil className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">
                {t("product_edit_title")}
              </span>
            </Button>
          )}
        </div>

        {basicInfoQuery.isLoading && (
          <p className="text-base text-slate-500">{t("suppliers_loading")}</p>
        )}

        {basicInfoQuery.error && (
          <p className="text-base text-red-400">{t("suppliers_error")}</p>
        )}

        {!basicInfoQuery.isLoading && !basicInfoQuery.error && !supplier && (
          <p className="text-base text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {t("suppliers_empty")}
          </p>
        )}

        {supplier && (
          <div className="space-y-4">
            {/* Basic identity */}
            <DetailSection title={t("settings_supplier_details")}>
              <dl className="space-y-1 mb-1 text-base">
                {supplier.originalTitle && (
                  <DetailRow
                    label={t("supplier_original_title")}
                    value={supplier.originalTitle}
                  />
                )}

                {isEditingTitle ? (
                  <div className="space-y-2 pt-1">
                    <label className="text-sm font-medium text-slate-600">
                      {t("supplier_custom_title")}
                    </label>
                    <Input
                      value={editCustomTitle}
                      onChange={(e) => setEditCustomTitle(e.target.value)}
                      className="text-base"
                      aria-label={t("supplier_custom_title")}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveCustomTitle}
                        disabled={personalizedUpdate.isPending}
                      >
                        {personalizedUpdate.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("product_save_title")
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEditingTitle}
                        disabled={personalizedUpdate.isPending}
                      >
                        {t("product_cancel_edit")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DetailRow
                    label={t("supplier_custom_title")}
                    value={supplier.customTitle ?? "-"}
                  />
                )}

                {supplier.vat && (
                  <DetailRow
                    label={t("supplier_vat_label")}
                    value={supplier.vat}
                  />
                )}
                {supplier.mainActivity && (
                  <DetailRow
                    label={t("supplier_main_activity")}
                    value={supplier.mainActivity}
                  />
                )}
              </dl>
            </DetailSection>

            {/* Contact */}
            {(supplier.phone ||
              supplier.customPhone ||
              supplier.email ||
              supplier.customEmail) && (
              <DetailSection title={t("settings_contact")}>
                <dl className="space-y-1 mb-1 text-base">
                  {supplier.customPhone && (
                    <DetailRow
                      label={t("erg_phone")}
                      value={
                        <a
                          href={`tel:${supplier.customPhone}`}
                          className="text-brand-600 hover:underline"
                        >
                          {supplier.customPhone}
                        </a>
                      }
                    />
                  )}
                  {!supplier.customPhone && supplier.phone && (
                    <DetailRow
                      label={t("erg_phone")}
                      value={
                        <a
                          href={`tel:${supplier.phone}`}
                          className="text-brand-600 hover:underline"
                        >
                          {supplier.phone}
                        </a>
                      }
                    />
                  )}
                  {supplier.customEmail && (
                    <DetailRow
                      label={t("supplier_email")}
                      value={
                        <a
                          href={`mailto:${supplier.customEmail}`}
                          className="text-brand-600 hover:underline"
                        >
                          {supplier.customEmail}
                        </a>
                      }
                    />
                  )}
                  {!supplier.customEmail && supplier.email && (
                    <DetailRow
                      label={t("supplier_email")}
                      value={
                        <a
                          href={`mailto:${supplier.email}`}
                          className="text-brand-600 hover:underline"
                        >
                          {supplier.email}
                        </a>
                      }
                    />
                  )}
                </dl>
              </DetailSection>
            )}

            {/* Address */}
            {(supplier.address || supplier.postalCode || supplier.city) && (
              <DetailSection title={t("settings_address")}>
                <dl className="space-y-1 mb-1 text-base">
                  {supplier.address && (
                    <DetailRow
                      label={t("erg_address")}
                      value={supplier.address}
                    />
                  )}
                  {(supplier.postalCode || supplier.city) && (
                    <DetailRow
                      label={t("erg_city")}
                      value={[supplier.postalCode, supplier.city]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  )}
                </dl>
              </DetailSection>
            )}

            {/* Notes */}
            {supplier.personalNotes && (
              <DetailSection title={t("supplier_notes")}>
                <p className="whitespace-pre-wrap text-base text-slate-800">
                  {supplier.personalNotes}
                </p>
              </DetailSection>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
