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
  const hasRestoredSectionRef = useRef(false);
  const lockActiveUntilRef = useRef<number>(0);

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

  useEffect(() => {
    if (filteredSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockActiveUntilRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => {
            const id = e.target.getAttribute("data-section-id");
            return {
              id,
              top: e.boundingClientRect.top,
              bottom: e.boundingClientRect.bottom,
              ratio: e.intersectionRatio,
            };
          })
          .filter(
            (
              x,
            ): x is {
              id: string;
              top: number;
              bottom: number;
              ratio: number;
            } => !!x.id,
          );

        if (visible.length === 0) return;

        const lineY = scrollOffset;
        const started = visible.filter((v) => v.top <= lineY + 1);

        let activeId: string;
        if (started.length > 0) {
          activeId = started.reduce((best, curr) =>
            curr.top > best.top ? curr : best,
          ).id;
        } else {
          activeId = visible.reduce((best, curr) =>
            curr.top < best.top ? curr : best,
          ).id;
        }

        setActiveSectionId(activeId);
      },
      {
        root: null,
        rootMargin: `-${scrollOffset}px 0px -60% 0px`,
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 1],
      },
    );

    filteredSections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
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
