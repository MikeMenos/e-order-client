"use client";
import { useEffect, useRef, useState } from "react";
import { useActiveTabsStore } from "@/stores/activeTabs";
import type { SupplierSection } from "@/lib/types/supplier";

type Options = {
  filteredSections: SupplierSection[];
  mainTab: string;
  sectionTabKey: string;
  scrollOffset: number;
};

export function useSupplierSectionScrollSpy({
  filteredSections,
  mainTab,
  sectionTabKey,
  scrollOffset,
}: Options) {
  const setActiveTab = useActiveTabsStore((s) => s.setActiveTab);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevMainTabRef = useRef<string | null>(null);
  const prevFilteredSectionsRef = useRef<SupplierSection[]>([]);
  const hasRestoredSectionRef = useRef(false);
  const lockActiveUntilRef = useRef<number>(0);

  useEffect(() => {
    if (filteredSections.length === 0) return;
    const prev = prevFilteredSectionsRef.current;
    const sectionIdsChanged =
      prev.length !== filteredSections.length ||
      prev.some((s, i) => filteredSections[i]?.id !== s.id);
    prevFilteredSectionsRef.current = filteredSections;
    // When sections change (e.g. category added/removed), reset to first so active tab stays correct
    if (sectionIdsChanged && prev.length > 0) {
      setActiveSectionId(filteredSections[0].id);
      lockActiveUntilRef.current = Date.now() + 400;
    } else if (prev.length > 0) {
      lockActiveUntilRef.current = Date.now() + 400;
    }
  }, [filteredSections]);

  useEffect(() => {
    if (filteredSections.length === 0) return;
    if (hasRestoredSectionRef.current) return;
    hasRestoredSectionRef.current = true;
    const stored = useActiveTabsStore.getState().getActiveTab(sectionTabKey);
    if (stored && filteredSections.some((s) => s.id === stored)) {
      setActiveSectionId(stored);
    } else {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [filteredSections, sectionTabKey]);

  useEffect(() => {
    if (prevMainTabRef.current !== null && prevMainTabRef.current !== mainTab) {
      setActiveSectionId(filteredSections[0]?.id ?? null);
    }
    prevMainTabRef.current = mainTab;
  }, [mainTab, filteredSections]);

  useEffect(() => {
    if (activeSectionId) setActiveTab(sectionTabKey, activeSectionId);
  }, [activeSectionId, sectionTabKey, setActiveTab]);

  useEffect(() => {
    if (filteredSections.length === 0) {
      setActiveSectionId(null);
      return;
    }
    if (
      !activeSectionId ||
      !filteredSections.some((s) => s.id === activeSectionId)
    ) {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [filteredSections, activeSectionId]);

  /** Use scroll listener to check ALL sections on each scroll. IntersectionObserver
   * only fires for entries that changed, giving partial data and clanky behavior. */
  useEffect(() => {
    if (filteredSections.length === 0) return;

    let rafId: number;

    const updateActiveFromScroll = () => {
      if (Date.now() < lockActiveUntilRef.current) return;

      const lineY = scrollOffset;
      let activeId: string | null = filteredSections[0]?.id ?? null;

      for (const section of filteredSections) {
        const el = sectionRefs.current[section.id];
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        // Active = last section whose top has scrolled past the threshold line
        if (top <= lineY + 1) {
          activeId = section.id;
        }
      }

      setActiveSectionId((prev) => (prev !== activeId ? activeId : prev));
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveFromScroll);
    };

    // Initial sync
    updateActiveFromScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [filteredSections, scrollOffset]);

  const setSectionRef = (sectionId: string, el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el;
  };

  const handleTabClick = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;

    setActiveSectionId(id);

    const lockDurationMs = 2000;
    lockActiveUntilRef.current = Date.now() + lockDurationMs;

    const onScrollEnd = () => {
      lockActiveUntilRef.current = 0;
      window.removeEventListener("scrollend", onScrollEnd);
    };
    window.addEventListener("scrollend", onScrollEnd, { once: true });

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { activeSectionId, setSectionRef, handleTabClick };
}
