import { ChevronDown } from "lucide-react";
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
};

export function SuppliersSectionHeader({
  isAscending,
  onSortToggle,
  statusOptions,
  selectedStatus,
  onStatusChange,
}: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const triggerLabel = selectedStatus
    ? selectedStatus
    : t("suppliers_filter_all");

  return (
    <div className="flex items-center justify-between">
      {pathname === "/orders-of-the-day" && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <h2 className="text-sm font-semibold text-slate-900">
            {t("suppliers_orders_of_day")}
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
