"use client";

import { motion } from "framer-motion";
import { SearchInput } from "../ui/search-input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { listItemVariants } from "../../lib/motion";
import type { SupplierSection } from "@/lib/types/supplier";
import { cn } from "../../lib/utils";

type Props = {
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sections: SupplierSection[];
  activeSectionId: string | null;
  onTabClick: (sectionId: string) => void;
  backgroundClassName?: string;
  /** When true, hide the category tabs (e.g. during loading) */
  hideTabs?: boolean;
};

export function SupplierSearchAndTabs({
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  sections,
  activeSectionId,
  onTabClick,
  backgroundClassName,
  hideTabs = false,
}: Props) {
  const value = activeSectionId ?? sections[0]?.id ?? "";
  const panelClassName = backgroundClassName ?? "bg-app-card/95";

  return (
    <div
      className={cn(
        "flex flex-col gap-0 pb-2 shrink-0 px-4 rounded-b-lg",
        panelClassName,
      )}
    >
      <div>
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={onSearchChange}
          className="h-9 w-full border border-slate-200 bg-white px-3 py-2 rounded-lg focus:outline-none"
        />
      </div>
      {!hideTabs && sections.length > 1 && (
        <div className="-mx-4 flex flex-col gap-0 rounded-2xl overflow-hidden">
          <Tabs value={value} onValueChange={onTabClick}>
            <motion.div
              className="overflow-x-auto border-slate-200/80 px-4 py-2"
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
            >
              <TabsList className={cn("h-auto w-max gap-2", panelClassName)}>
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className={[
                      "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold tracking-[0.18em] whitespace-nowrap",
                      "text-slate-500 transition",
                      "data-[state=active]:bg-brand-500 data-[state=active]:text-white",
                      "hover:text-slate-700",
                    ].join(" ")}
                  >
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>
          </Tabs>
        </div>
      )}
    </div>
  );
}
