"use client";

type EmptyStateProps = {
  children: React.ReactNode;
  className?: string;
};

export function EmptyState({
  children,
  className = "text-base text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block",
}: EmptyStateProps) {
  return <p className={className}>{children}</p>;
}
