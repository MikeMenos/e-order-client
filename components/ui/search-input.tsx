"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "./input";
import { Button } from "./button";

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, className, ...props }, ref) => {
    const hasValue = value.length > 0;
    const handleClear = () => {
      onChange("");
      onClear?.();
    };

    return (
      <div className="relative w-full">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          ref={ref}
          type="search"
          role="searchbox"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("pl-10!", hasValue && "pr-9", className)}
          {...props}
        />
        {hasValue && (
          <Button
            variant="ghost"
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
