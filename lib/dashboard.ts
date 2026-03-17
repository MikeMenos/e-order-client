import type { SuppliersListItem } from "./types/dashboard";

/** Pending tab: basketIconStatus 3 = pending, showInList true = visible */
export const isPendingVisible = (
  s: { basketIconStatus?: number | null; showInList?: boolean },
): boolean => s.basketIconStatus === 3 && s.showInList === true;

/** All tab: supplier is pending but hidden from Pending list */
export const isHiddenFromPending = (s: SuppliersListItem): boolean =>
  s.basketIconStatus === 3 && s.showInList === false;

/** Count for dashboard badge: Drafts + Pending (visible). Excludes hidden-from-pending. */
export const isCountedForOrdersOfDayBadge = (
  s: {
    isInPrefDaySchedule?: boolean;
    basketIconStatus?: number | null;
    showInList?: boolean;
  },
): boolean =>
  s.isInPrefDaySchedule === true &&
  (s.basketIconStatus === 2 ||
    (s.basketIconStatus === 3 && s.showInList === true));
