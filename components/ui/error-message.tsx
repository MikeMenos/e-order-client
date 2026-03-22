"use client";

type ErrorMessageProps = {
  children: React.ReactNode;
  className?: string;
};

const defaultClassName =
  "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800";

export function ErrorMessage({
  children,
  className = defaultClassName,
}: ErrorMessageProps) {
  return <div className={className} role="alert">{children}</div>;
}
