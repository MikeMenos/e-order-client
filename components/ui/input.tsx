import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, ...props }, ref) => {
    // For numeric inputs, prefer showing the numeric keypad on mobile devices.
    const resolvedInputMode =
      inputMode ?? (type === "number" ? "decimal" : undefined);

    return (
      <input
        ref={ref}
        type={type}
        inputMode={resolvedInputMode}
        className={cn(
          "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ring-offset-white",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
