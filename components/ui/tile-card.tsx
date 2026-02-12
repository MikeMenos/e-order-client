"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const tileCardClass =
  "flex h-full w-full flex-col items-stretch gap-2 rounded-2xl bg-white p-2 shadow-sm transition hover:shadow-md hover:shadow-slate-200/50 active:scale-[0.99] cursor-pointer";

const tileCardClassHorizontal =
  "flex h-full w-full flex-row items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md hover:shadow-slate-200/50 active:scale-[0.99] cursor-pointer";

type TileCardProps = {
  icon?: LucideIcon;
  iconSrc?: string;
  label: string;
  iconColor?: string;
  className?: string;
  horizontal?: boolean;
  "aria-label"?: string;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

export function TileCard({
  icon: Icon,
  iconSrc,
  label,
  iconColor = "text-slate-700",
  className,
  horizontal = false,
  "aria-label": ariaLabel,
  ...rest
}: TileCardProps) {
  /* Icon area - smaller when horizontal */
  const iconContent = iconSrc ? (
    <div className={cn(
      "flex shrink-0 items-center justify-center",
      horizontal ? "h-12 w-12" : "h-28 min-h-0 w-full"
    )}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconSrc}
        alt=""
        className={cn(
          "object-contain",
          horizontal ? "h-full w-full" : "h-full w-full max-w-full"
        )}
        aria-hidden
      />
    </div>
  ) : Icon ? (
    <div className={cn(
      "flex shrink-0 items-center justify-center",
      horizontal ? "h-12 w-12" : "h-28 w-full"
    )}>
      <Icon
        className={cn(
          iconColor,
          horizontal ? "h-8 w-8" : "h-full w-full max-h-24 max-w-24"
        )}
        aria-hidden
      />
    </div>
  ) : null;

  /* Label area */
  const content = (
    <>
      {iconContent}
      <div className={cn(
        "flex flex-1 items-center",
        horizontal ? "justify-start px-2" : "min-h-11 justify-center px-0.5"
      )}>
        <span className={cn(
          "text-lg font-medium text-slate-900 leading-tight wrap-break-word text-wrap",
          horizontal ? "text-left" : "text-center"
        )}>
          {label}
        </span>
      </div>
    </>
  );

  const cardClassName = horizontal ? tileCardClassHorizontal : tileCardClass;

  if ("href" in rest && rest.href) {
    return (
      <Link
        href={rest.href}
        className={cn(cardClassName, className)}
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
      className={cn(cardClassName, className)}
      aria-label={ariaLabel}
    >
      {content}
    </Button>
  );
}
