"use client";

import { useTranslation } from "@/lib/i18n";
import { Textarea } from "@/components/ui/textarea";

export type CheckoutCommentsSectionProps = {
  labelKey: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function CheckoutCommentsSection({
  labelKey,
  value,
  onChange,
  placeholder = "",
}: CheckoutCommentsSectionProps) {
  const { t } = useTranslation();
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-brand-600">
        {t(labelKey)}
      </h2>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] border-slate-300 focus-visible:ring-brand-500"
      />
    </section>
  );
}
