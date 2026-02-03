import { Input } from "../ui/input";
import { useTranslation } from "../../lib/i18n";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SuppliersSearchBar({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Input
      placeholder={t("suppliers_search_placeholder")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 border-0 bg-app-card/95 px-2 text-sm shadow-none focus-visible:ring-0 mt-2"
    />
  );
}
