import { Input } from "../ui/input";
import { useTranslation } from "../../lib/i18n";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SuppliersSearchBar({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
      <Input
        placeholder={t("suppliers_search_placeholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
