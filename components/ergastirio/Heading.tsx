"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";

interface ErgastirioHeadingProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function ErgastirioHeading({
  title,
  description,
  actions,
  className,
}: ErgastirioHeadingProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-0 shadow-none bg-transparent",
        className,
      )}
    >
      <CardContent className="flex flex-col gap-1 items-center md:items-start">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-base text-slate-500 text-center">{description}</p>
        )}
      </CardContent>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </Card>
  );
}
