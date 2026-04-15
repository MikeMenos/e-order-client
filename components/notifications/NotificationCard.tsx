"use client";

import type { NotificationItem } from "@/lib/types/notifications";
import { format, isToday, parseISO } from "date-fns";

const MONTHS_GR_SHORT = [
  "Ιαν",
  "Φεβρ",
  "Μαρ",
  "Απρ",
  "Μαϊ",
  "Ιουν",
  "Ιουλ",
  "Αυγ",
  "Σεπ",
  "Οκτ",
  "Νοε",
  "Δεκ",
];

function parseNotificationDate(value: string): Date | null {
  try {
    const date = parseISO(value);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function formatNotificationDateRight(value: string): string {
  const date = parseNotificationDate(value);
  if (!date) return value.slice(0, 10);
  if (isToday(date)) return format(date, "HH:mm");
  return `${date.getDate()} ${MONTHS_GR_SHORT[date.getMonth()]}`;
}

type NotificationCardProps = {
  item: NotificationItem;
  isMarking: boolean;
  onMarkAsRead: (notificationUID: string) => void;
};

export function NotificationCard({
  item,
  isMarking,
  onMarkAsRead,
}: NotificationCardProps) {
  const isUnread = !item.isRead;
  const borderClass = isUnread ? "border-brand-500" : "border-slate-200";
  const dotClass = isUnread ? "bg-brand-500" : "bg-slate-200";

  return (
    <div
      className={`rounded-xl bg-white px-3 py-3 shadow-sm border transition ${
        borderClass
      } ${isUnread ? "" : "opacity-80"} focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-1`}
      role={isUnread ? "button" : undefined}
      tabIndex={isUnread ? 0 : undefined}
      onClick={() => {
        if (!isUnread || isMarking) return;
        onMarkAsRead(item.notificationUID);
      }}
      onKeyDown={(e) => {
        if (!isUnread || isMarking) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onMarkAsRead(item.notificationUID);
        }
      }}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-slate-900">{item.title}</p>
          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            <span className="text-xs text-slate-500">
              {formatNotificationDateRight(item.dateCreated)}
            </span>
            <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
          </div>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap wrap-break-word text-base text-slate-700">
          {item.message}
        </p>
      </div>
    </div>
  );
}
