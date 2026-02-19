import { useEffect, useState } from "react";

const DEFAULT_THRESHOLD_RATIO = 0.5;

export function useBackToTop(thresholdRatio = DEFAULT_THRESHOLD_RATIO) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const threshold =
      typeof window !== "undefined" ? window.innerHeight * thresholdRatio : 400;
    const onScroll = () => setShowBackToTop(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [thresholdRatio]);

  return showBackToTop;
}
