"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { SupplierSection } from "./types";

type Props = {
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sections: SupplierSection[];
  activeSectionId: string | null;
  onTabClick: (sectionId: string) => void;
};

export function SupplierSearchAndTabs({
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  sections,
  activeSectionId,
  onTabClick,
}: Props) {
  return (
    <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-0 bg-slate-50/95 px-4 pb-2 pt-2 backdrop-blur">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      {sections.length > 0 && (
        <div className="-mx-4 overflow-x-auto border-y border-slate-100 px-4 py-2">
          <nav className="flex min-w-0 gap-4 text-sm font-semibold tracking-wide">
            {sections.map((section) => {
              const isActive = section.id === activeSectionId;
              return (
                <Button
                  key={section.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabClick(section.id)}
                  className={[
                    "shrink-0 border-b-2 rounded-none pb-1 px-0 text-sm font-semibold tracking-[0.18em] whitespace-nowrap",
                    isActive
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-700",
                  ].join(" ")}
                >
                  {section.label}
                </Button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
