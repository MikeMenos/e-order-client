import { SearchInput } from "../ui/search-input";
import { useTranslation } from "../../lib/i18n";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SuppliersSearchBar({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <SearchInput
      placeholder={t("suppliers_search_placeholder")}
      value={value}
      onChange={onChange}
      className="h-9 border border-slate-300 bg-app-card/95 px-3 py-2 text-sm shadow-sm focus-visible:ring-0"
    />
  );
}
