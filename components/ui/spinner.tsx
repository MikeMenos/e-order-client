import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: number;
  className?: string;
};

export function Spinner({ size = 32, className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex items-center justify-center", className)}
    >
      <div
        className="animate-spin rounded-full border-2 border-slate-200 border-t-brand-500"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
