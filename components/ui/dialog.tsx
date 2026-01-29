import * as React from "react";
import { cn } from "../../lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange?.(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {children}
    </div>
  );
}

type DialogContentProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogContent({ className, children }: DialogContentProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1 border-b border-slate-100 pb-3">{children}</div>
  );
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-md font-semibold text-slate-900">{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600">{children}</p>;
}
