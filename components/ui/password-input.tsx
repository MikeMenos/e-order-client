"use client";

import * as React from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input, type InputProps } from "./input";

export interface PasswordInputProps extends Omit<InputProps, "type"> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const hasValue = value != null && String(value).length > 0;

    const handleClear = () => {
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={cn(hasValue ? "pr-16" : "pr-9", className)}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
