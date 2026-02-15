import {
  ChevronDown,
  Clock,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
} from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type Props = {
  isAscending: boolean;
  onSortToggle: () => void;
  statusOptions: string[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  ordersOfTheDayCount: number;
};

export function SuppliersSectionHeader({
  isAscending,
  onSortToggle,
  statusOptions,
  selectedStatus,
  onStatusChange,
  ordersOfTheDayCount,
}: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const triggerLabel = selectedStatus
    ? selectedStatus
    : t("suppliers_filter_all");

  return (
    <div className="flex items-center justify-between">
      {pathname === "/orders-of-the-day" && (
        <div className="flex items-center gap-2 text-base text-slate-500">
          <div
            className="flex items-center gap-0.5"
            role="group"
            aria-label={t("suppliers_sort_by_time")}
          >
            <Clock
              className="h-5 w-5 text-slate-400 shrink-0 bg-white backdrop-blur-sm rounded-lg"
              aria-hidden
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-300 text-slate-700"
              aria-label={
                isAscending ? t("suppliers_sort_asc") : t("suppliers_sort_desc")
              }
              onClick={onSortToggle}
            >
              {isAscending ? (
                <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            {t("suppliers_orders_of_day")} ({ordersOfTheDayCount})
          </h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-slate-300 text-slate-700"
                aria-label={t("suppliers_filter_by_status")}
              >
                {triggerLabel}
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuRadioGroup
                value={selectedStatus}
                onValueChange={onStatusChange}
              >
                <DropdownMenuRadioItem value="">
                  {t("suppliers_filter_all")}
                </DropdownMenuRadioItem>
                {statusOptions.map((opt) => (
                  <DropdownMenuRadioItem key={opt} value={opt}>
                    {opt}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
