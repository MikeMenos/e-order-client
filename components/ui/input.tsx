import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, value, onChange, onFocus, onBlur, ...props }, ref) => {
    // For numeric inputs, prefer showing the numeric keypad on mobile devices.
    const resolvedInputMode =
      inputMode ?? (type === "number" ? "decimal" : undefined);

    // Track original value when focus happens and whether we cleared it
    const originalValueRef = React.useRef<string | number | readonly string[] | undefined>(undefined);
    const wasClearedOnFocusRef = React.useRef(false);
    const clearedValueRef = React.useRef<string>("");

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Clear value on focus for number inputs that have a value
      if (type === "number" && value != null && value !== "") {
        // Store original value before clearing
        originalValueRef.current = value;
        wasClearedOnFocusRef.current = true;
        clearedValueRef.current = "";
        
        // Create a synthetic event to clear the value
        // We still call onChange, but parent components can check if value is empty
        // and skip API calls if it matches the pattern of "cleared on focus"
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: "" },
          currentTarget: { ...e.currentTarget, value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
      } else {
        // Not clearing, so reset flags
        wasClearedOnFocusRef.current = false;
        originalValueRef.current = undefined;
      }
      // Call the original onFocus handler if provided
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Reset flags - parent components will handle restoration
      wasClearedOnFocusRef.current = false;
      originalValueRef.current = undefined;
      clearedValueRef.current = "";
      // Call the original onBlur handler if provided
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Track the cleared value when user clears on focus
      if (wasClearedOnFocusRef.current && e.target.value === "") {
        clearedValueRef.current = "";
      }
      // If value changes from empty, mark that user actually changed it
      if (wasClearedOnFocusRef.current && e.target.value !== "" && e.target.value !== clearedValueRef.current) {
        wasClearedOnFocusRef.current = false;
        originalValueRef.current = undefined;
      }
      onChange?.(e);
    };

    return (
      <input
        ref={ref}
        type={type}
        inputMode={resolvedInputMode}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ring-offset-white",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
