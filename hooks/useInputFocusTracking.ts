import { useEffect, useState } from "react";

export function useInputFocusTracking() {
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = (e.target as HTMLElement)?.tagName;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target)) {
        setIsInputFocused(true);
      }
    };
    const onFocusOut = () => setIsInputFocused(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return isInputFocused;
}
