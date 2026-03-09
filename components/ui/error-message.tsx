"use client";

type ErrorMessageProps = {
  children: React.ReactNode;
  className?: string;
};

export function ErrorMessage({
  children,
  className = "text-base text-red-400",
}: ErrorMessageProps) {
  return <p className={className}>{children}</p>;
}
