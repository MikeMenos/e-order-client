"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  show: boolean;
  onClick: () => void;
  ariaLabel: string;
  className?: string;
};

export function BackToTopButton({
  show,
  onClick,
  ariaLabel,
  className = "fixed bottom-24 right-4 z-20 md:bottom-6 md:right-6",
}: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full border-slate-200 shadow-lg hover:bg-slate-50"
            onClick={onClick}
            aria-label={ariaLabel}
          >
            <ChevronUp className="h-6 w-6 text-brand-500" aria-hidden />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
