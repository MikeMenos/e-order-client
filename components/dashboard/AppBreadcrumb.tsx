"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { useTranslation } from "@/lib/i18n";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABEL_KEYS: Record<string, string> = {
  dashboard: "breadcrumb_dashboard",
  settings: "settings_title",
  "manage-suppliers": "settings_manage_suppliers",
  account: "breadcrumb_account",
  "all-suppliers": "dashboard_card_suppliers",
  basket: "basket_title",
  configuration: "config_title",
  "fav-suppliers": "config_link_fav_suppliers",
  "order-hours": "config_link_order_hours",
  "order-retake": "config_link_order_retake",
  users: "config_link_users",
  suppliers: "dashboard_card_suppliers",
  checkout: "breadcrumb_checkout",
  "order-history": "supplier_order_history_title",
};

function getLabelKey(
  segment: string,
  pathParts: string[],
  index: number,
): string {
  const key = SEGMENT_LABEL_KEYS[segment];
  if (key) return key;
  // Dynamic segment: e.g. supplier UID under /suppliers
  if (pathParts[index - 1] === "suppliers") return "common_supplier";
  return segment;
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  if (pathname === "/orders-of-the-day" || pathname === "/dashboard")
    return null;

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  /** Parent href for a segment; use app routes (e.g. /all-suppliers not /suppliers). */
  function getSegmentHref(segmentIndex: number): string {
    const part = parts[segmentIndex];
    const defaultHref = "/" + parts.slice(0, segmentIndex + 1).join("/");
    if (part === "suppliers" && segmentIndex === 0) return "/all-suppliers";
    return defaultHref;
  }

  /** Only treat last segment as a link when query params indicate a sub-step (e.g. ?menu= on manage-suppliers). Ignore data params like refDate. */
  const stepParams = pathname.startsWith("/settings/manage-suppliers")
    ? ["menu"]
    : [];
  const hasStepParams =
    stepParams.length > 0 &&
    stepParams.some((key) => searchParams.has(key));

  const segments: {
    href: string;
    label: string;
    isLast: boolean;
    linkEvenIfLast?: boolean;
  }[] = [];
  const prependDashboard = parts[0] !== "dashboard";

  if (prependDashboard) {
    segments.push({
      href: "/dashboard",
      label: t("breadcrumb_dashboard"),
      isLast: false,
    });
  }

  for (let i = 0; i < parts.length; i++) {
    const href = getSegmentHref(i);
    const labelKey = getLabelKey(parts[i], parts, i);
    const isLast = i === parts.length - 1;
    segments.push({
      href,
      label: t(labelKey),
      isLast,
      linkEvenIfLast: isLast && hasStepParams,
    });
  }

  return (
    <Breadcrumb className="rounded-b-2xl bg-slate-50/60 py-2.5">
      <div className="min-w-0 overflow-x-auto">
        <BreadcrumbList className="gap-2 text-slate-500 flex-nowrap w-max px-4 [&>span]:shrink-0">
          {segments.map((seg, idx) => (
          <span
            key={seg.href + (seg.linkEvenIfLast ? "?reset" : "")}
            className="contents"
          >
            {idx > 0 && (
              <BreadcrumbSeparator className="text-slate-300 [&>svg]:size-4" />
            )}
            <BreadcrumbItem>
              {seg.isLast && !seg.linkEvenIfLast ? (
                <BreadcrumbPage className="font-medium text-slate-800">
                  {seg.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={seg.href}
                    className="rounded-md px-1.5 py-0.5 transition-colors hover:text-slate-800 hover:bg-slate-200/50"
                  >
                    {seg.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
        </BreadcrumbList>
      </div>
    </Breadcrumb>
  );
}
