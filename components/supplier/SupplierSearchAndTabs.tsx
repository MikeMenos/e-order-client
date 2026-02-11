"use client";

import { motion } from "framer-motion";
import { SearchInput } from "../ui/search-input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { listItemVariants } from "../../lib/motion";
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
    <div className="flex flex-col gap-0 bg-app-card/95 px-4 rounded-b-lg">
      <div className="border-b border-slate-200/80 pb-3">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={onSearchChange}
          className="h-9 w-full border border-slate-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
      {sections.length > 1 && (
        <div className="-mx-4 flex flex-col gap-0 bg-app-card/95">
          <Tabs value={value} onValueChange={onTabClick}>
            <motion.div
              className="overflow-x-auto border-b border-slate-200/80 px-4 pt-2 pb-2 bg-app-card/95"
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
            >
              <TabsList className="h-auto w-max gap-2 bg-app-card/95">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className={[
                      "shrink-0 rounded-full px-4 py-2 text-sm font-semibold tracking-[0.18em] whitespace-nowrap",
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
