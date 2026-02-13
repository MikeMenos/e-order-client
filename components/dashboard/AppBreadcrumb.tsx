"use client";

import { useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { useTranslation } from "@/lib/i18n";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
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
  "order-schedule": "settings_order_schedule",
  account: "breadcrumb_account",
  "all-suppliers": "dashboard_card_suppliers",
  basket: "basket_title",
  configuration: "config_title",
  "fav-suppliers": "config_link_fav_suppliers",
  "order-hours": "config_link_order_hours",
  "order-retake": "config_link_order_retake",
  users: "config_link_users",
  add: "breadcrumb_user_add",
  suppliers: "dashboard_card_suppliers",
  checkout: "breadcrumb_checkout",
  "order-history": "supplier_order_history_title",
  info: "breadcrumb_supplier_info",
  statistics: "dashboard_card_statistics",
  "partner-suppliers": "dashboard_card_partner_suppliers",
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
  const { suppliers } = useSuppliersListForToday();
  const activeRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "end",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, searchParams?.toString()]);

  if (pathname === "/orders-of-the-day" || pathname === "/dashboard")
    return null;

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  // Special-case: manage-suppliers menu step
  // Dashboard -> Settings -> Manage suppliers -> [Supplier title] (active)
  const menuSupplierUID =
    pathname === "/settings/manage-suppliers" ? searchParams.get("menu") : null;
  if (menuSupplierUID) {
    const selectedSupplier = suppliers?.find(
      (s) => s.supplierUID === menuSupplierUID,
    );
    const lastLabel = selectedSupplier?.title ?? t("settings_manage_suppliers");

    const manageSuppliersBase = "/settings/manage-suppliers";
    const manageSuppliersWithMenu = `/settings/manage-suppliers?menu=${encodeURIComponent(menuSupplierUID)}`;

    const segments = [
      {
        href: "/dashboard",
        label: t("breadcrumb_dashboard"),
        isLast: false,
      },
      {
        href: "/settings",
        label: t("settings_title"),
        isLast: false,
      },
      {
        href: manageSuppliersBase,
        label: t("settings_manage_suppliers"),
        isLast: false,
      },
      {
        href: manageSuppliersWithMenu,
        label: lastLabel,
        isLast: true,
      },
    ];

    return (
      <Breadcrumb className="bg-slate-50/60 py-2.5 z-10 ">
        <div className="min-w-0 overflow-x-auto">
          <BreadcrumbList className="gap-2 text-slate-500 flex-nowrap w-max px-4 [&>span]:shrink-0">
            {segments.map((seg, idx) => (
              <span
                key={seg.href + String(idx)}
                ref={seg.isLast ? activeRef : undefined}
                className={seg.isLast ? "inline-flex items-center shrink-0" : "contents"}
              >
                {idx > 0 && (
                  <BreadcrumbSeparator className="text-slate-500 [&>svg]:size-4" />
                )}
                <BreadcrumbItem>
                  {seg.isLast ? (
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

  // Special-case: supplier subpages (order-history, info, timetable, etc.)
  // Trail depends on how user got here: from=settings → Settings trail; from=suppliers → All suppliers trail
  const supplierSubpageMatch = pathname.match(
    /^\/suppliers\/([^/]+)\/(info|order-history|timetable|favorites|contact|reviews)$/,
  );
  const fromParam = searchParams.get("from");

  if (
    supplierSubpageMatch &&
    (fromParam === "settings" || fromParam === "suppliers" || fromParam === "orders-of-the-day")
  ) {
    const supplierUID = supplierSubpageMatch[1];
    const section = supplierSubpageMatch[2] as
      | "info"
      | "order-history"
      | "timetable"
      | "favorites"
      | "contact"
      | "reviews";

    const selectedSupplier = suppliers?.find(
      (s) => s.supplierUID === supplierUID,
    );
    const supplierTitle = selectedSupplier?.title ?? t("common_supplier");

    let sectionLabel: string;
    switch (section) {
      case "info":
        sectionLabel = t("breadcrumb_supplier_info");
        break;
      case "order-history":
        sectionLabel = t("supplier_order_history_title");
        break;
      case "timetable":
        sectionLabel = t("settings_order_schedule");
        break;
      case "favorites":
        sectionLabel = t("settings_favorites");
        break;
      case "contact":
        sectionLabel = t("settings_contact");
        break;
      case "reviews":
        sectionLabel = t("settings_reviews");
        break;
      default:
        sectionLabel = t(section);
    }

    const currentHref = pathname + (fromParam ? `?from=${encodeURIComponent(fromParam)}` : "");

    const segments =
      fromParam === "settings"
        ? [
            {
              href: "/dashboard",
              label: t("breadcrumb_dashboard"),
              isLast: false,
            },
            { href: "/settings", label: t("settings_title"), isLast: false },
            {
              href: "/settings/manage-suppliers",
              label: t("settings_manage_suppliers"),
              isLast: false,
            },
            {
              href: `/settings/manage-suppliers?menu=${encodeURIComponent(supplierUID)}`,
              label: supplierTitle,
              isLast: false,
            },
            { href: currentHref, label: sectionLabel, isLast: true },
          ]
        : fromParam === "orders-of-the-day"
        ? [
            {
              href: "/orders-of-the-day",
              label: t("suppliers_orders_of_day"),
              isLast: false,
            },
            {
              href: `/suppliers/${encodeURIComponent(supplierUID)}?from=orders-of-the-day`,
              label: selectedSupplier?.subTitle ?? selectedSupplier?.customTitle ?? selectedSupplier?.title ?? supplierTitle,
              isLast: false,
            },
            { href: currentHref, label: sectionLabel, isLast: true },
          ]
        : [
            {
              href: "/dashboard",
              label: t("breadcrumb_dashboard"),
              isLast: false,
            },
            {
              href: "/all-suppliers",
              label: t("dashboard_card_suppliers"),
              isLast: false,
            },
            {
              href: `/suppliers/${encodeURIComponent(supplierUID)}`,
              label: supplierTitle,
              isLast: false,
            },
            { href: currentHref, label: sectionLabel, isLast: true },
          ];

    return (
      <Breadcrumb className="rounded-b-lg bg-slate-50/60 py-2.5">
        <div className="min-w-0 overflow-x-auto">
          <BreadcrumbList className="gap-2 text-slate-500 flex-nowrap w-max px-4 [&>span]:shrink-0">
            {segments.map((seg, idx) => (
              <span
                key={seg.href + String(idx)}
                ref={seg.isLast ? activeRef : undefined}
                className={seg.isLast ? "inline-flex items-center shrink-0" : "contents"}
              >
                {idx > 0 && (
                  <BreadcrumbSeparator className="text-slate-500 [&>svg]:size-4" />
                )}
                <BreadcrumbItem>
                  {seg.isLast ? (
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

  // Special-case: checkout page /suppliers/[supplierUID]/checkout
  const checkoutMatch = pathname.match(/^\/suppliers\/([^/]+)\/checkout$/);
  if (checkoutMatch) {
    const supplierUID = checkoutMatch[1];
    const fromParam = searchParams.get("from");
    const isFromOrdersOfDay = fromParam === "orders-of-the-day";
    
    const selectedSupplier = suppliers?.find(
      (s) => s.supplierUID === supplierUID,
    );
    
    // Use subTitle for orders-of-the-day, title for others
    const supplierLabel = isFromOrdersOfDay
      ? selectedSupplier?.subTitle ?? selectedSupplier?.customTitle ?? selectedSupplier?.title ?? t("common_supplier")
      : selectedSupplier?.title ?? t("common_supplier");

    const queryString = isFromOrdersOfDay ? "?from=orders-of-the-day" : "";

    const segments = isFromOrdersOfDay
      ? [
          {
            href: "/orders-of-the-day",
            label: t("suppliers_orders_of_day"),
            isLast: false,
          },
          {
            href: `/suppliers/${encodeURIComponent(supplierUID)}${queryString}`,
            label: supplierLabel,
            isLast: false,
          },
          {
            href: pathname + queryString,
            label: t("breadcrumb_checkout"),
            isLast: true,
          },
        ]
      : [
          { href: "/dashboard", label: t("breadcrumb_dashboard"), isLast: false },
          {
            href: "/all-suppliers",
            label: t("dashboard_card_suppliers"),
            isLast: false,
          },
          {
            href: `/suppliers/${encodeURIComponent(supplierUID)}`,
            label: supplierLabel,
            isLast: false,
          },
          {
            href: pathname,
            label: t("breadcrumb_checkout"),
            isLast: true,
          },
        ];

    return (
      <Breadcrumb className="rounded-b-lg bg-slate-50/60 py-2.5">
        <div className="min-w-0 overflow-x-auto">
          <BreadcrumbList className="gap-2 text-slate-500 flex-nowrap w-max px-4 [&>span]:shrink-0">
            {segments.map((seg, idx) => (
              <span
                key={seg.href + String(idx)}
                ref={seg.isLast ? activeRef : undefined}
                className={seg.isLast ? "inline-flex items-center shrink-0" : "contents"}
              >
                {idx > 0 && (
                  <BreadcrumbSeparator className="text-slate-500 [&>svg]:size-4" />
                )}
                <BreadcrumbItem>
                  {seg.isLast ? (
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

  // Special-case: supplier detail page /suppliers/[supplierUID] (e.g. from all-suppliers or orders-of-the-day)
  const supplierDetailMatch = pathname.match(/^\/suppliers\/([^/]+)$/);
  if (supplierDetailMatch) {
    const supplierUID = supplierDetailMatch[1];
    const fromParam = searchParams.get("from");
    const isFromOrdersOfDay = fromParam === "orders-of-the-day";
    
    const selectedSupplier = suppliers?.find(
      (s) => s.supplierUID === supplierUID,
    );
    
    // Use subTitle for orders-of-the-day, title for others
    const supplierLabel = isFromOrdersOfDay
      ? selectedSupplier?.subTitle ?? selectedSupplier?.customTitle ?? selectedSupplier?.title ?? t("common_supplier")
      : selectedSupplier?.title ?? t("common_supplier");

    const segments = isFromOrdersOfDay
      ? [
          {
            href: "/orders-of-the-day",
            label: t("suppliers_orders_of_day"),
            isLast: false,
          },
          {
            href: pathname + "?from=orders-of-the-day",
            label: supplierLabel,
            isLast: true,
          },
        ]
      : [
          { href: "/dashboard", label: t("breadcrumb_dashboard"), isLast: false },
          {
            href: "/all-suppliers",
            label: t("dashboard_card_suppliers"),
            isLast: false,
          },
          {
            href: pathname,
            label: supplierLabel,
            isLast: true,
          },
        ];

    return (
      <Breadcrumb className="rounded-b-lg bg-slate-50/60 py-2.5">
        <div className="min-w-0 overflow-x-auto">
          <BreadcrumbList className="gap-2 text-slate-500 flex-nowrap w-max px-4 [&>span]:shrink-0">
            {segments.map((seg, idx) => (
              <span
                key={seg.href + String(idx)}
                ref={seg.isLast ? activeRef : undefined}
                className={seg.isLast ? "inline-flex items-center shrink-0" : "contents"}
              >
                {idx > 0 && (
                  <BreadcrumbSeparator className="text-slate-500 [&>svg]:size-4" />
                )}
                <BreadcrumbItem>
                  {seg.isLast ? (
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

  /** Parent href for a segment; use app routes (e.g. /all-suppliers not /suppliers). */
  function getSegmentHref(segmentIndex: number): string {
    const part = parts[segmentIndex];
    const defaultHref = "/" + parts.slice(0, segmentIndex + 1).join("/");
    if (part === "suppliers" && segmentIndex === 0) return "/all-suppliers";
    return defaultHref;
  }

  /** Only treat last segment as a link when query params indicate a sub-step (e.g. ?menu= on manage-suppliers). */
  const stepParams = pathname.startsWith("/settings/manage-suppliers")
    ? ["menu"]
    : [];
  const hasStepParams =
    stepParams.length > 0 && stepParams.some((key) => searchParams.has(key));

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
    <Breadcrumb className="rounded-b-lg bg-slate-50/60 py-2.5">
      <div className="min-w-0 overflow-x-auto">
        <BreadcrumbList className="gap-2 text-slate-500 flex-nowrap w-max px-4 [&>span]:shrink-0">
          {segments.map((seg, idx) => (
            <span
              key={seg.href + (seg.linkEvenIfLast ? "?reset" : "")}
              ref={seg.isLast && !seg.linkEvenIfLast ? activeRef : undefined}
              className={seg.isLast && !seg.linkEvenIfLast ? "inline-flex items-center shrink-0" : "contents"}
            >
              {idx > 0 && (
                <BreadcrumbSeparator className="text-slate-500 [&>svg]:size-4" />
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
