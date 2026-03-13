"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth";
import { useSupplierDisplay } from "@/hooks/useSupplier";
import { useBasketItems } from "@/hooks/useBasket";
import { useOrderAdd } from "@/hooks/useOrderAdd";
import { useOrderTempSave } from "@/hooks/useOrderTempSave";
import { getApiErrorMessage } from "@/lib/api-error";
import { isApiSuccess, getApiResponseMessage } from "@/lib/api-response";
import {
  getDefaultDeliveryDateNoRefDate,
  getDefaultDeliveryDateWithRefDate,
  refDateInWeekDailyAnalysis,
} from "@/lib/utils";
import { CheckoutPageHeader } from "@/components/checkout/CheckoutPageHeader";
import { CheckoutBasketSection } from "@/components/checkout/CheckoutBasketSection";
import { CheckoutDeliverySection } from "@/components/checkout/CheckoutDeliverySection";
import { CheckoutCommentsSection } from "@/components/checkout/CheckoutCommentsSection";
import { CheckoutActionBar } from "@/components/checkout/CheckoutActionBar";
import { SubmitOrderConfirmDialog } from "@/components/checkout/SubmitOrderConfirmDialog";
import { useTranslation } from "@/lib/i18n";
import type { BasketGetItemsResponse } from "@/lib/types/checkout-basket";

function toISOOrNull(dateStr: string | null): string | null {
  if (!dateStr?.trim()) return null;
  try {
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

function toYyyyMmDd(dateStr: string | null): string | null {
  if (!dateStr?.trim()) return null;
  const slice = dateStr.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

type WeekDayItem = {
  dateObj: string;
  dayIsClosed: boolean;
  supplierCanDeliver: boolean;
  supplierCanProcessOrder?: boolean;
};

function isDeliveryDateBlocked(
  effectiveDate: string | null,
  weekDailyAnalysis: WeekDayItem[],
): boolean {
  const key = toYyyyMmDd(effectiveDate);
  if (!key) return false;
  const item = weekDailyAnalysis.find((it) => it.dateObj.slice(0, 10) === key);
  return item ? item.dayIsClosed || !item.supplierCanDeliver : false;
}

export default function SupplierCheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID ?? "";
  const searchParams = useSearchParams();
  const supplierInfoQuery = useSupplierDisplay(supplierUID);
  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const selectedDate = supplierInfoQuery.data?.selectedDate ?? null;
  const users = useAuthStore((s) => s.users);
  const currentUserName = useMemo(
    () =>
      [users?.userInfos?.fname, users?.userInfos?.lname]
        .filter(Boolean)
        .join(" ") ||
      users?.userInfos?.username ||
      "",
    [users?.userInfos?.fname, users?.userInfos?.lname, users?.userInfos?.username],
  );

  const refDateFromUrl = searchParams.get("refDate")
    ? toYyyyMmDd(searchParams.get("refDate"))
    : null;

  const [comments, setComments] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [hasBasketItems, setHasBasketItems] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const hasPrefilledFromBasketRef = useRef(false);

  const basketQuery = useBasketItems({
    SupplierUID: supplierUID,
    enabled: !!supplierUID,
  });
  const basketData = basketQuery.data as BasketGetItemsResponse | undefined;
  const basketForSupplier =
    basketData?.basketsList?.find((b) => b.supplierUID === supplierUID) ??
    basketData?.basketsList?.[0];

  /** API may return desiredDeliveryDate or desiredliveryDate (typo) */
  const desiredDeliveryDateFromBasket =
    basketForSupplier?.desiredDeliveryDate ??
    (basketForSupplier as { desiredliveryDate?: string } | undefined)
      ?.desiredliveryDate;

  useEffect(() => {
    if (hasPrefilledFromBasketRef.current || !basketForSupplier) return;
    hasPrefilledFromBasketRef.current = true;
    const desiredStr = toYyyyMmDd(desiredDeliveryDateFromBasket ?? null);
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (
      desiredStr &&
      desiredStr > todayStr &&
      !refDateFromUrl
    ) {
      setDeliveryDate(desiredStr);
    }
    if (
      basketForSupplier.shopperComments != null &&
      basketForSupplier.shopperComments !== ""
    ) {
      setComments(basketForSupplier.shopperComments);
    }
  }, [basketForSupplier, refDateFromUrl]);

  const orderAddMutation = useOrderAdd({
    onSuccess: (data) => {
      if (data != null && isApiSuccess(data as { statusCode?: number })) {
        if (searchParams.get("from") === "orders-of-the-day") {
          router.replace("/orders-of-the-day");
        } else {
          router.replace("/all-suppliers");
        }
      } else {
        toast.error(getApiResponseMessage(data) || t("basket_error"));
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });
  const orderTempSaveMutation = useOrderTempSave({
    onSuccess: (data) => {
      if (data != null && isApiSuccess(data)) {
        toast.success(data?.message?.trim() || t("checkout_temporary_save"));
      } else {
        toast.error(
          data?.message ?? data?.detailedMessage ?? t("basket_error"),
        );
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const isSubmitting = orderAddMutation.isPending;
  const isSavingTemp = orderTempSaveMutation.isPending;

  const {
    defaultDeliveryDate,
    selectedDateForDelivery,
    isDesiredDateValid,
    refDateNotInRange,
    isEmptyAnalysis,
  } = useMemo(() => {
      const analysis = supplier?.weekDailyAnalysis ?? [];
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const desiredDateStr = toYyyyMmDd(
        desiredDeliveryDateFromBasket ?? null,
      );
      const isDesiredInFuture =
        desiredDateStr && desiredDateStr > todayStr;
      const isDesiredValid =
        isDesiredInFuture &&
        refDateInWeekDailyAnalysis(desiredDateStr, analysis) &&
        !isDeliveryDateBlocked(desiredDateStr, analysis);

      if (analysis.length === 0) {
        return {
          defaultDeliveryDate: null,
          selectedDateForDelivery: null,
          isDesiredDateValid: false,
          refDateNotInRange: true,
          isEmptyAnalysis: true,
        };
      }

      if (!refDateFromUrl) {
        const defaultDate = getDefaultDeliveryDateNoRefDate(analysis, todayStr);
        const fallback = defaultDate ?? toYyyyMmDd(selectedDate);
        return {
          defaultDeliveryDate: fallback,
          selectedDateForDelivery: isDesiredValid
            ? desiredDateStr
            : (fallback ?? null),
          isDesiredDateValid: !!isDesiredValid,
          refDateNotInRange: false,
          isEmptyAnalysis: false,
        };
      }

      if (!refDateInWeekDailyAnalysis(refDateFromUrl, analysis)) {
        return {
          defaultDeliveryDate: null,
          selectedDateForDelivery: null,
          isDesiredDateValid: false,
          refDateNotInRange: true,
          isEmptyAnalysis: false,
        };
      }

      const defaultDate = getDefaultDeliveryDateWithRefDate(
        refDateFromUrl,
        analysis,
      );
      const fallback = defaultDate ?? toYyyyMmDd(selectedDate);
      return {
        defaultDeliveryDate: fallback,
        selectedDateForDelivery: isDesiredValid
          ? desiredDateStr
          : (fallback ?? null),
        isDesiredDateValid: !!isDesiredValid,
        refDateNotInRange: false,
        isEmptyAnalysis: false,
      };
    }, [
      supplier?.weekDailyAnalysis,
      selectedDate,
      refDateFromUrl,
      desiredDeliveryDateFromBasket,
    ]);

  const effectiveDeliveryDate =
    deliveryDate?.trim() ||
    selectedDateForDelivery ||
    defaultDeliveryDate;
  const isDeliveryDateInvalid = isDeliveryDateBlocked(
    effectiveDeliveryDate,
    supplier?.weekDailyAnalysis ?? [],
  );

  const handleTemporarySave = () => {
    const desiredDeliveryDate = toISOOrNull(effectiveDeliveryDate);
    orderTempSaveMutation.mutate({
      supplierUID,
      extraComments: comments,
      desiredDeliveryDate: desiredDeliveryDate as string,
    });
  };

  const handleSubmitOrderClick = () => {
    setSubmitConfirmOpen(true);
  };

  const handleSubmitOrderConfirm = () => {
    setSubmitConfirmOpen(false);
    const desiredDeliveryDate = toISOOrNull(effectiveDeliveryDate);
    orderAddMutation.mutate({
      supplierUID,
      extraComments: comments,
      desiredDeliveryDate: desiredDeliveryDate as string,
    });
  };

  if (supplierInfoQuery.error) {
    return (
      <main className="min-h-screen flex flex-col pb-36 text-slate-900 px-2 pt-6">
        <p className="text-base text-red-400">
          {getApiErrorMessage(
            supplierInfoQuery.error,
            t("supplier_error_products"),
          )}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col pb-36 text-slate-900 px-2">
      <CheckoutPageHeader
        titleKey="order_completion_title"
        supplierName={supplier?.title ?? null}
        supplierLogo={supplier?.logo ?? null}
        savedByUserName={
          (basketData?.basketsList?.length ?? 0) > 0 &&
          (basketForSupplier?.items?.length ?? 0) > 0 &&
          !!(desiredDeliveryDateFromBasket?.trim?.())
            ? currentUserName || null
            : null
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto -mx-3 px-3 space-y-3">
        <CheckoutBasketSection
          supplierUID={supplierUID}
          onHasItemsChange={setHasBasketItems}
        />
        <CheckoutDeliverySection
          selectedDate={selectedDateForDelivery ?? null}
          desiredDeliveryDateFromBasket={desiredDeliveryDateFromBasket}
          initialDeliveryDate={
            refDateFromUrl || isDesiredDateValid
              ? undefined
              : desiredDeliveryDateFromBasket
          }
          onEffectiveDateChange={setDeliveryDate}
          weekDailyAnalysis={supplier?.weekDailyAnalysis ?? []}
          refDateNotInRange={refDateNotInRange}
          isEmptyAnalysis={isEmptyAnalysis}
          refDateDisplay={refDateFromUrl}
        />
        <CheckoutCommentsSection
          labelKey="checkout_comments"
          value={comments}
          onChange={setComments}
        />
      </div>

      <CheckoutActionBar
        temporarySaveLabelKey="checkout_temporary_save"
        submitOrderLabelKey="checkout_submit_order"
        onTemporarySave={handleTemporarySave}
        onSubmitOrder={handleSubmitOrderClick}
        isSubmitting={isSubmitting}
        isTemporarySaveLoading={isSavingTemp}
        isSubmitDisabled={
          !hasBasketItems ||
          isDeliveryDateInvalid ||
          refDateNotInRange ||
          (supplier?.weekDailyAnalysis ?? []).length === 0
        }
      />

      <SubmitOrderConfirmDialog
        open={submitConfirmOpen}
        onOpenChange={setSubmitConfirmOpen}
        onConfirm={handleSubmitOrderConfirm}
        isSubmitting={orderAddMutation.isPending}
      />
    </main>
  );
}
