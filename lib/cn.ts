import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Server-safe className utility. Use this in components that may render on the server. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
