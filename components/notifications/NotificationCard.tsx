"use client";

import { Button } from "@/components/ui/button";
import type { NotificationItem } from "@/lib/types/notifications";
import { format, parseISO, isValid } from "date-fns";

function formatNotificationDate(value: string): string {
  try {
    const date = parseISO(value);
    if (!isValid(date)) return value.slice(0, 16);
    return format(date, "dd MMM yyyy HH:mm");
  } catch {
    return value;
  }
}

type NotificationCardProps = {
  item: NotificationItem;
  markAsReadLabel: string;
  isMarking: boolean;
  onMarkAsRead: (notificationUID: string) => void;
};

export function NotificationCard({
  item,
  markAsReadLabel,
  isMarking,
  onMarkAsRead,
}: NotificationCardProps) {
  return (
    <div
      className={`rounded-xl bg-white px-4 py-2 shadow-sm ${
        item.isRead
          ? "border border-slate-200 opacity-75"
          : "border-2 border-brand-500"
      }`}
    >
      <div className="flex flex-col gap-2 w-full">
        <p className="font-semibold text-slate-900">{item.title}</p>
        <p className="text-sm text-slate-600 w-full">{item.message}</p>
        <p className="text-xs text-slate-400">
          {formatNotificationDate(item.dateCreated)}
        </p>
        {!item.isRead && (
          <div className="flex justify-center mt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={isMarking}
              onClick={() => onMarkAsRead(item.notificationUID)}
            >
              {markAsReadLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
