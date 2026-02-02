import { useEffect, useRef, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () =>
      setHeight(Math.ceil(el.getBoundingClientRect().height));
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const onLoad = () => measure();
    window.addEventListener("load", onLoad);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return { ref, height };
}

export function formatOrderDate(value: unknown): string {
  if (value == null) return "";
  const date =
    typeof value === "string"
      ? parseISO(value)
      : value instanceof Date
      ? value
      : new Date(Number(value));
  if (!isValid(date))
    return typeof value === "string" ? value.slice(0, 10) : String(value);
  return format(date, "dd-MM-yyyy");
}

export function formatMoney(value: unknown): string {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `${n.toFixed(2)} €`;
}
