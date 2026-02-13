"use client";

import { useParams } from "next/navigation";
import { useSupplierBasicInfos } from "@/hooks/useDashboardData";
import { useTranslation } from "@/lib/i18n";
import { DetailSection } from "@/components/ui/detail-section";
import { DetailRow } from "@/components/ui/detail-row";

export default function SupplierInfoPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID;

  const basicInfoQuery = useSupplierBasicInfos(supplierUID, !!supplierUID);
  const supplier =
    basicInfoQuery.data?.supplier ??
    basicInfoQuery.data?.suppliers?.[0] ??
    null;

  const displayName =
    supplier?.customTitle?.trim() ||
    supplier?.originalTitle?.trim() ||
    supplier?.supplierUID ||
    "";

  return (
    <main className=" text-slate-900 px-3">
      <div className="mx-auto max-w-2xl">
        <div className="my-4">
          <h1 className="text-xl font-bold text-slate-900">
            {displayName || t("common_supplier")}
          </h1>
        </div>

        {basicInfoQuery.isLoading && (
          <p className="text-sm text-slate-500">{t("suppliers_loading")}</p>
        )}

        {basicInfoQuery.error && (
          <p className="text-sm text-red-400">{t("suppliers_error")}</p>
        )}

        {!basicInfoQuery.isLoading && !basicInfoQuery.error && !supplier && (
          <p className="text-sm text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {t("suppliers_empty")}
          </p>
        )}

        {supplier && (
          <div className="space-y-4">
            {/* Basic identity */}
            <DetailSection title={t("settings_supplier_details")}>
              <dl className="space-y-1 text-sm">
                {supplier.originalTitle && (
                  <DetailRow
                    label={t("supplier_original_title")}
                    value={supplier.originalTitle}
                  />
                )}

                <DetailRow
                  label={t("supplier_custom_title")}
                  value={supplier.customTitle ?? "-"}
                />

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
                <dl className="space-y-1 text-sm">
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
                <dl className="space-y-1 text-sm">
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
                <p className="whitespace-pre-wrap text-sm text-slate-800">
                  {supplier.personalNotes}
                </p>
              </DetailSection>
            )}

            {/* Delivery schedule text + days */}
            {(supplier.weekDeliveryDaysText ||
              (supplier.weekDeliverySchedule &&
                supplier.weekDeliverySchedule.length > 0)) && (
              <DetailSection title={t("checkout_delivery")}>
                {supplier.weekDeliveryDaysText && (
                  <p className="mb-2 text-sm text-slate-800">
                    {supplier.weekDeliveryDaysText}
                  </p>
                )}
                {supplier.weekDeliverySchedule &&
                  supplier.weekDeliverySchedule.length > 0 && (
                    <ul className="space-y-1 text-sm">
                      {supplier.weekDeliverySchedule.map((d, idx) => (
                        <li
                          key={`${d.shortDay ?? d.deliveryDay ?? idx}`}
                          className="flex justify-between gap-4"
                        >
                          <span className="text-slate-600">
                            {d.shortDay || d.deliveryDay}
                          </span>
                          <span className="text-right text-slate-900">
                            {d.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
              </DetailSection>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
