"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "./input";

export interface ClearableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Text input with an X icon to clear the value when non-empty.
 * Wraps Input with a clear button, matching the pattern used in SearchInput and order-schedule.
 */
export const ClearableInput = React.forwardRef<
  HTMLInputElement,
  ClearableInputProps
>(({ className, value, onChange, ...props }, ref) => {
  const hasValue =
    value != null && String(value).trim().length > 0;

  const handleClear = () => {
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
  };

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        className={cn(hasValue && "pr-10", className)}
        {...props}
      />
      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label="Clear"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

ClearableInput.displayName = "ClearableInput";
