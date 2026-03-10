"use client";

import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  prevLabel: string;
  nextLabel: string;
};

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  prevLabel,
  nextLabel,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 0}
        onClick={() => onPageChange(Math.max(0, page - 1))}
      >
        {prevLabel}
      </Button>
      <span className="flex items-center px-2 text-slate-600">
        {page + 1} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
