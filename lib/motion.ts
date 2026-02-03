import type { Variants } from "framer-motion";

/**
 * Use on the list container with initial="hidden" animate="visible".
 * Items animate only by sliding up (y); no opacity change so list is visible on first render.
 */
export const listVariants: Variants = {
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
  hidden: {},
};

/** Use on each list item — slide up only (no opacity) so first paint is visible */
export const listItemVariants: Variants = {
  visible: { y: 0 },
  hidden: { y: 8 },
};
