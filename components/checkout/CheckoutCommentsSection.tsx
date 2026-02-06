"use client";

import { Textarea } from "@/components/ui/textarea";
import { CheckoutSectionHeading } from "./CheckoutSectionHeading";

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
  return (
    <section className="mb-6">
      <CheckoutSectionHeading labelKey={labelKey} />
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] border-slate-300 focus-visible:ring-brand-500"
      />
    </section>
  );
}
