"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const tileCardClass =
  "flex h-full w-full flex-col items-stretch gap-2 rounded-2xl bg-white p-2 shadow-sm transition hover:shadow-md hover:shadow-slate-200/50 active:scale-[0.99] cursor-pointer";

type TileCardProps = {
  icon?: LucideIcon;
  iconSrc?: string;
  label: string;
  iconColor?: string;
  className?: string;
  "aria-label"?: string;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

export function TileCard({
  icon: Icon,
  iconSrc,
  label,
  iconColor = "text-slate-700",
  className,
  "aria-label": ariaLabel,
  ...rest
}: TileCardProps) {
  /* Fixed-height icon area so images align across the grid */
  const iconContent = iconSrc ? (
    <div className="flex h-28 min-h-0 shrink-0 w-full items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconSrc}
        alt=""
        className="h-full w-full max-w-full object-contain"
        aria-hidden
      />
    </div>
  ) : Icon ? (
    <div className="flex h-28 shrink-0 items-center justify-center w-full">
      <Icon
        className={cn("h-full w-full max-h-24 max-w-24", iconColor)}
        aria-hidden
      />
    </div>
  ) : null;

  /* Fixed-height label area so text aligns across the grid */
  const content = (
    <>
      {iconContent}
      <div className="flex h-11 shrink-0 items-center justify-center">
        <span className="text-center text-lg font-medium text-slate-900 leading-tight line-clamp-2 px-0.5">
          {label}
        </span>
      </div>
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
    <Button
      variant={"ghost"}
      onClick={"onClick" in rest ? rest.onClick : undefined}
      className={cn(tileCardClass, className)}
      aria-label={ariaLabel}
    >
      {content}
    </Button>
  );
}
