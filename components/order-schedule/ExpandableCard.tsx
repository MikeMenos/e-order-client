"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TileCard } from "@/components/ui/tile-card"; // adjust import path if needed

type ExpandableTileProps = {
  label: string;
  icon?: any; // LucideIcon if you want
  iconSrc?: string;
  iconColor?: string;
  className?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
};

export function ExpandableTileCard({
  label,
  icon,
  iconSrc,
  iconColor,
  className,
  defaultOpen = false,
  children,
  "aria-label": ariaLabel,
}: ExpandableTileProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("w-full", className)}
    >
      {/* Make the whole tile clickable */}
      <CollapsibleTrigger asChild>
        <div className="relative">
          <TileCard
            label={label}
            icon={icon}
            iconSrc={iconSrc}
            iconColor={iconColor}
            onClick={() => setOpen((v) => !v)}
            aria-label={ariaLabel ?? label}
            horizontal
            className="pr-12" // space for chevron
          />

          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
