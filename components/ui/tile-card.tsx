"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tileCardClass =
  "flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md hover:shadow-slate-200/50 active:scale-[0.99] cursor-pointer";

type TileCardProps = {
  icon: LucideIcon;
  label: string;
  iconColor?: string;
  className?: string;
  "aria-label"?: string;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

export function TileCard({
  icon: Icon,
  label,
  iconColor = "text-slate-700",
  className,
  "aria-label": ariaLabel,
  ...rest
}: TileCardProps) {
  const content = (
    <>
      <Icon
        className={cn("h-12 w-12 shrink-0", iconColor)}
        aria-hidden
      />
      <span className="text-center text-sm font-medium text-slate-900">
        {label}
      </span>
    </>
  );

  if ("href" in rest && rest.href) {
    return (
      <Link
        href={rest.href}
        className={cn(tileCardClass, className)}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={"onClick" in rest ? rest.onClick : undefined}
      className={cn(tileCardClass, className)}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
