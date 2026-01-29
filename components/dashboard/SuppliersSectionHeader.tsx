import { Button } from "../ui/button";
import { useTranslation } from "../../lib/i18n";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Clock } from "lucide-react";

type Props = {
  isAscending: boolean;
  onSortToggle: () => void;
  showCompleted: boolean;
  onShowCompletedChange: (checked: boolean) => void;
};

export function SuppliersSectionHeader({
  isAscending,
  onSortToggle,
  showCompleted,
  onShowCompletedChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-slate-900">
        {t("suppliers_orders_of_day")}
      </h2>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span
          className="flex items-center gap-1.5"
          title={t("suppliers_sort_by_time")}
        >
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span className="whitespace-nowrap">
            {t("suppliers_sort_by_time")}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onSortToggle}
            className="h-7 w-7 shrink-0 text-sm"
            aria-label={
              isAscending ? "Sort latest first" : "Sort earliest first"
            }
          >
            {isAscending ? "↑" : "↓"}
          </Button>
        </span>
        <Label className="flex items-center gap-1 mb-0">
          <Input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => onShowCompletedChange(e.target.checked)}
            className="h-3 w-3 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
          />
          <span>{t("suppliers_include_completed")}</span>
        </Label>
      </div>
    </div>
  );
}
