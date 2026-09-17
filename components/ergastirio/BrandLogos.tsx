"use client";

import { cn } from "@/lib/utils";
import {
  ERGASTIRIO_LOGO_LEFT,
  ERGASTIRIO_LOGO_RIGHT,
} from "@/lib/ergastirio-constants";

type BrandLogosProps = {
  size?: number;
  className?: string;
  imageClassName?: string;
  gapClassName?: string;
};

export function ErgastirioBrandLogos({
  size = 56,
  className,
  imageClassName,
  gapClassName = "gap-0.5",
}: BrandLogosProps) {
  return (
    <div
      className={cn("flex items-center shrink-0", gapClassName, className)}
      aria-label="Ergastirio"
    >
      <img
        src={ERGASTIRIO_LOGO_LEFT}
        alt=""
        width={size}
        height={size}
        className={cn("object-contain", imageClassName)}
      />
      <img
        src={ERGASTIRIO_LOGO_RIGHT}
        alt=""
        width={size}
        height={size}
        className={cn("object-contain", imageClassName)}
      />
    </div>
  );
}
