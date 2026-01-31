"use client";

import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
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
  const value = activeSectionId ?? sections[0]?.id ?? "";

  return (
    <div className="-mx-4 flex flex-col gap-0 bg-slate-50 px-4">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      {sections.length > 0 && (
        <Tabs value={value} onValueChange={onTabClick}>
          <div className="-mx-4 overflow-x-auto border-y border-slate-100 px-4 py-2">
            <TabsList className="h-auto w-max gap-4 bg-transparent p-0">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className={[
                    "shrink-0 rounded px-0 p-1 text-sm font-semibold tracking-[0.18em] whitespace-nowrap",
                    "border-b-2 border-transparent text-slate-400",
                    "data-[state=active]:border-brand-600 data-[state=active]:text-brand-600",
                    "hover:text-slate-700",
                  ].join(" ")}
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}
    </div>
  );
}
